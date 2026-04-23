export declare class TelegramService {
    private readonly logger;
    private readonly baseUrl;
    private readonly token;
    private readonly groupChatId;
    constructor();
    sendGroupMessage(text: string): Promise<boolean>;
    sendDirectMessage(chatId: string, text: string): Promise<boolean>;
    createInviteLink(): Promise<string | null>;
    formatWhaleAlert(from: string, to: string, amount: string, txHash: string): string;
}
