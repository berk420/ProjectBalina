import { FirebaseService } from '../firebase/firebase.service';
import { TelegramService } from '../telegram/telegram.service';
export declare class NotificationsService {
    private readonly firebaseService;
    private readonly telegramService;
    private readonly logger;
    private readonly tokens;
    constructor(firebaseService: FirebaseService, telegramService: TelegramService);
    registerToken(token: string): Promise<{
        success: boolean;
    }>;
    unregisterToken(token: string): Promise<{
        success: boolean;
    }>;
    getTelegramInviteLink(phoneNumber: string): Promise<{
        inviteLink: string | null;
        message: string;
    }>;
}
