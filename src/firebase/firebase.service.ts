import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor() {
    const useFirebase = process.env.USE_FIREBASE === 'true';

    if (!useFirebase) {
      this.logger.warn('Firebase disabled by USE_FIREBASE=false');
      return;
    }

    // 나중에 Firebase 정상 설정되면 여기 다시 활성화
    /*
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    */
  }
}