import { OnModuleInit } from '@nestjs/common';
export interface Transfer {
    id: string;
    from: string;
    to: string;
    amount: string;
    amountFormatted: string;
    txHash: string;
    blockNumber: number;
    timestamp: number;
}
export declare class TransfersService implements OnModuleInit {
    private transfers;
    onModuleInit(): void;
    save(transfer: Transfer): void;
    findRecent(limit?: number): Transfer[];
    findAll(): Transfer[];
    private persist;
}
