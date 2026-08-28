import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { RegisterFcmTokenDto } from '../dto/other.dto';

@Controller('fb')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  /* @Post('tk')
  async sendPushNotification(@Body() body: { token: string, message: string }) {
    const { token, message } = body;

    // FirebaseService를 사용하여 푸시 알림 전송
    await this.firebaseService.sendPushNotification(token, message);

    return { message: '푸시 알림이 전송되었습니다.' };
  } */
  @Post('tk')
  async registerToken(
    @CurrentUser('hashedUserId')
    hashedUserId: string,
    @Body()
    dto: RegisterFcmTokenDto,
  )
  {
    await this.firebaseService.registerToken(hashedUserId, dto.token );
    return { ok: true, message: 'FCM 기기 토큰 등록 완료' };
  }
}
