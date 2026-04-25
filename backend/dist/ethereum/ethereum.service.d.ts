import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { TelegramService } from '../telegram/telegram.service';
import { TransfersService } from '../transfers/transfers.service';
export declare class EthereumService implements OnModuleInit, OnModuleDestroy {
    private readonly firebaseService;
    private readonly telegramService;
    private readonly transfersService;
    private readonly logger;
    private provider;
    private iface;
    private pollTimer;
    private lastBlock;
    private readonly processedTxHashes;
    constructor(firebaseService: FirebaseService, telegramService: TelegramService, transfersService: TransfersService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private poll;
    private handleTransferEvent;
    getStatus(): {
        connected: boolean;
        contractAddress: string;
        threshold: string;
    };
}
