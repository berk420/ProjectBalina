import { TelegramService } from '../telegram/telegram.service';
export declare class NotificationsService {
    private readonly telegramService;
    private readonly logger;
    constructor(telegramService: TelegramService);
    getTelegramInviteLink(phoneNumber: string): Promise<{
        inviteLink: string | null;
        message: string;
    }>;
}
