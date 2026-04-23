import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { TelegramService } from '../telegram/telegram.service';

const FCM_TOPIC = 'whale-alerts';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly tokens = new Set<string>();

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly telegramService: TelegramService,
  ) {}

  async registerToken(token: string): Promise<{ success: boolean }> {
    this.tokens.add(token);
    const success = await this.firebaseService.subscribeToTopic(token, FCM_TOPIC);
    this.logger.log(`Token registered: ${token.slice(0, 20)}...`);
    return { success };
  }

  async unregisterToken(token: string): Promise<{ success: boolean }> {
    this.tokens.delete(token);
    const success = await this.firebaseService.unsubscribeFromTopic(token, FCM_TOPIC);
    return { success };
  }

  async getTelegramInviteLink(phoneNumber: string): Promise<{ inviteLink: string | null; message: string }> {
    this.logger.log(`Telegram invite requested for: ${phoneNumber}`);
    const inviteLink = await this.telegramService.createInviteLink();

    if (inviteLink) {
      return {
        inviteLink,
        message: 'Aşağıdaki linke tıklayarak Telegram grubuna katılabilirsiniz.',
      };
    }

    return {
      inviteLink: null,
      message: 'Davet linki oluşturulamadı. Lütfen tekrar deneyin.',
    };
  }
}
