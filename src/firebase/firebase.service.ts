import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as admin from 'firebase-admin';
import { Repository } from 'typeorm';
import { FcmDeviceToken } from './fcmDeviceToken.entity';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(
    @InjectRepository(FcmDeviceToken)
    private readonly tokenRepository: Repository<FcmDeviceToken>,
  ) {
    const useFirebase = process.env.USE_FIREBASE === 'true';

    if (!useFirebase) {
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
}