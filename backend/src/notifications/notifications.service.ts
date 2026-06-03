import { Injectable, Logger } from '@nestjs/common';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly telegramService: TelegramService,
  ) {}

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
