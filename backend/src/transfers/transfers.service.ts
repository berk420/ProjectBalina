import { Injectable } from '@nestjs/common';

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

@Injectable()
export class TransfersService {
  private transfers: Transfer[] = [];
  private readonly MAX_TRANSFERS = 100;

  save(transfer: Transfer): void {
    this.transfers.unshift(transfer);
    if (this.transfers.length > this.MAX_TRANSFERS) {
      this.transfers = this.transfers.slice(0, this.MAX_TRANSFERS);
    }
  }

  findAll(): Transfer[] {
    return this.transfers;
  }

  findRecent(limit = 20): Transfer[] {
    return this.transfers.slice(0, limit);
  }
}
