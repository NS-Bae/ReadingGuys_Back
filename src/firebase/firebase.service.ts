import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { FcmDeviceToken } from './fcmDeviceToken.entity';
import { User } from '../users/users.entity';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private readonly useFirebase: boolean;
  private firebaseReady = false;
  constructor(
    @InjectRepository(FcmDeviceToken)
    private readonly tokenRepository: Repository<FcmDeviceToken>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  )
  {
    const useFirebase = process.env.USE_FIREBASE === 'true';

    if(!this.useFirebase)
    {
      this.logger.warn('Firebase disabled by USE_FIREBASE=false');
      return;
    }
  }

  async registerToken(hashedUserId: string, token: string): Promise<void>
  {
    /*
     * FCM 토큰은 기기를 식별하므로
     * 사용자 ID와 관계없이 토큰 자체로 찾는다.
     */
    const existingToken =
      await this.tokenRepository.findOne({
        where: {
          token,
        },
      });

    if(existingToken)
    {
      existingToken.hashedUserId = hashedUserId;
      existingToken.isActive = true;
      existingToken.lastSeenAt = new Date();

      await this.tokenRepository.save(existingToken);

      return;
    }

    const newToken = this.tokenRepository.create({
        hashedUserId,
        token,
        isActive: true,
        lastSeenAt: new Date(),
      });

    await this.tokenRepository.save(newToken);
  }

  async sendNewWorkbookNotification(workbookId: number, workbookName: string,): Promise<void>
  {
    if(!this.firebaseReady)
    {
      this.logger.warn('Firebase가 준비되지 않아 푸시 발송을 생략합니다.');
      return;
    }

    const deviceTokens = await this.tokenRepository.createQueryBuilder('fcmToken')
      .innerJoin(User, 'user', 'user.hashedUserId = fcmToken.hashedUserId')
      .where('fcmToken.isActive = :tokenActive', {tokenActive: true})
      .andWhere('user.ok = :userActive', {userActive: true})
      .select('fcmToken.token','token')
      .getRawMany<{token: string}>();

    const tokens = [ ...new Set( deviceTokens.map(item => item.token) )];

    if(tokens.length === 0)
    {
      this.logger.log('푸시를 받을 활성 기기가 없습니다.');
      return;
    }

    /*
    * Firebase multicast는 한 번에 최대
    * 500개의 대상만 처리한다.
    */
    const chunkSize = 500;
    const invalidTokens: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    for(let index = 0; index < tokens.length; index += chunkSize)
    {
      const chunk = tokens.slice(index, index + chunkSize);
      const response = await getMessaging()
          .sendEachForMulticast({
            tokens: chunk,
            notification: {
              title: '새로운 독해가 등록됐어요',
              body: `${workbookName} 문제집을 확인해 보세요.`,
            },
            data: {
              type: 'workbook-upload',
              workbookId: String(workbookId),
              workbookName,
            },
            android: {
              notification: { channelId: 'workbook_updates' },
            },
          });
      successCount += response.successCount;
      failureCount += response.failureCount;
      response.responses.forEach((result, responseIndex) => {
          if(result.success) { return; }

          const errorCode = result.error?.code;

          if(
            errorCode === 'messaging/registration-token-not-registered' ||
            errorCode === 'messaging/invalid-registration-token'
          )
          {
            invalidTokens.push( chunk[responseIndex] );
          }

          this.logger.warn(`FCM 발송 실패: ${errorCode}`);
        },
      );
    }

    if(invalidTokens.length > 0)
    {
      await this.tokenRepository.update(
        {
          token: In(invalidTokens),
        },
        {
          isActive: false,
        },
      );
    }
    this.logger.log(
      `문제집 푸시 발송 완료: 성공 ${successCount}, 실패 ${failureCount}`,
    );
  }
}