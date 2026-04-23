import { OnModuleInit } from '@nestjs/common';
export declare class FirebaseService implements OnModuleInit {
    private readonly logger;
    private app;
    onModuleInit(): void;
    sendToTopic(topic: string, data: Record<string, string>, notification: {
        title: string;
        body: string;
    }): Promise<string | null>;
    sendToToken(token: string, data: Record<string, string>, notification: {
        title: string;
        body: string;
    }): Promise<string | null>;
    subscribeToTopic(token: string, topic: string): Promise<boolean>;
    unsubscribeFromTopic(token: string, topic: string): Promise<boolean>;
}
