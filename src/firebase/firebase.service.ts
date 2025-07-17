import * as admin from 'firebase-admin';
import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
});

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private readonly firebaseApp: admin.app.App;

  constructor() {}
  // FCM 푸시 알림 보내기
  async sendPushNotification(fcmToken: string, message: string): Promise<void> {
    try {
      const messagePayload = {
        token: fcmToken, // FCM 토큰
        notification: {
          title: '새로운 책이 업로드 되었습니다.',
          body: message,
        },
      };

      // FCM 서버로 푸시 알림 전송
      const response = await admin.messaging().send(messagePayload);
      console.log('푸시 알림 전송 성공:', response);
    } 
    catch (error) 
    {
      console.error('푸시 알림 전송 실패:', error);
      throw new Error('FCM 푸시 알림 전송에 실패했습니다.');
    }
  }

  async sendNotification(deviceToken: string, title: string, body: string) {
    const message = {
      token: deviceToken,
      notification: {
        title,
        body,
      },
    };
  }
}
