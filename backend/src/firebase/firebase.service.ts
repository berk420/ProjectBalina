import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: admin.app.App;

  onModuleInit() {
    try {
      const sdkPath = path.resolve(process.env.FIREBASE_ADMIN_SDK_PATH || './firebase-adminsdk.json');
      const serviceAccount = JSON.parse(fs.readFileSync(sdkPath, 'utf8'));

      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.logger.log('Firebase Admin SDK initialized');
    } catch (err) {
      this.logger.error('Firebase init failed', err.message);
    }
  }

  async sendToTopic(topic: string, data: Record<string, string>, notification: { title: string; body: string }): Promise<string | null> {
    try {
      const message: admin.messaging.Message = {
        topic,
        notification,
        data,
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
        webpush: {
          notification: { ...notification, icon: '/icon.png' },
          headers: { Urgency: 'high' },
        },
      };

      const messageId = await admin.messaging().send(message);
      this.logger.log(`FCM message sent to topic [${topic}]: ${messageId}`);
      return messageId;
    } catch (err) {
      this.logger.error('FCM send failed', err.message);
      return null;
    }
  }

  async sendToToken(token: string, data: Record<string, string>, notification: { title: string; body: string }): Promise<string | null> {
    try {
      const message: admin.messaging.Message = {
        token,
        notification,
        data,
        android: { priority: 'high' },
        webpush: {
          notification: { ...notification, icon: '/icon.png' },
          headers: { Urgency: 'high' },
        },
      };

      const messageId = await admin.messaging().send(message);
      this.logger.log(`FCM message sent to token: ${messageId}`);
      return messageId;
    } catch (err) {
      this.logger.error('FCM send to token failed', err.message);
      return null;
    }
  }

  async subscribeToTopic(token: string, topic: string): Promise<boolean> {
    try {
      await admin.messaging().subscribeToTopic([token], topic);
      this.logger.log(`Token subscribed to topic [${topic}]`);
      return true;
    } catch (err) {
      this.logger.error('Subscribe to topic failed', err.message);
      return false;
    }
  }

  async unsubscribeFromTopic(token: string, topic: string): Promise<boolean> {
    try {
      await admin.messaging().unsubscribeFromTopic([token], topic);
      return true;
    } catch (err) {
      this.logger.error('Unsubscribe from topic failed', err.message);
      return false;
    }
  }
}
