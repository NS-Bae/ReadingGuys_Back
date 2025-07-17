import { Controller, Post, Body } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Controller('fb')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('tk')
  async sendPushNotification(@Body() body: { token: string, message: string }) {
    const { token, message } = body;

    // FirebaseService를 사용하여 푸시 알림 전송
    await this.firebaseService.sendPushNotification(token, message);

    return { message: '푸시 알림이 전송되었습니다.' };
  }
}
