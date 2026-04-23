import { NotificationsService } from './notifications.service';
import { RegisterTokenDto } from './dto/register-token.dto';
import { JoinTelegramDto } from './dto/join-telegram.dto';
import { TransfersService } from '../transfers/transfers.service';
export declare class NotificationsController {
    private readonly notificationsService;
    private readonly transfersService;
    constructor(notificationsService: NotificationsService, transfersService: TransfersService);
    registerToken(dto: RegisterTokenDto): Promise<{
        success: boolean;
    }>;
    unregisterToken(dto: RegisterTokenDto): Promise<{
        success: boolean;
    }>;
    joinTelegram(dto: JoinTelegramDto): Promise<{
        inviteLink: string | null;
        message: string;
    }>;
    getTransfers(limit?: string): import("../transfers/transfers.service").Transfer[];
    health(): {
        status: string;
        timestamp: string;
    };
}
