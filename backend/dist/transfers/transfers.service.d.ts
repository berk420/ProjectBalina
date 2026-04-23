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
export declare class TransfersService {
    private transfers;
    private readonly MAX_TRANSFERS;
    save(transfer: Transfer): void;
    findAll(): Transfer[];
    findRecent(limit?: number): Transfer[];
}
