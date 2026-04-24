import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

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

const STORE_PATH = path.resolve(process.cwd(), 'transfers.json');
const MAX_TRANSFERS = 100;

@Injectable()
export class TransfersService implements OnModuleInit {
  private transfers: Transfer[] = [];

  onModuleInit() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf8');
        this.transfers = JSON.parse(raw);
      }
    } catch {
      this.transfers = [];
    }
  }

  save(transfer: Transfer): void {
    if (this.transfers.some(t => t.txHash === transfer.txHash)) return;
    this.transfers.unshift(transfer);
    if (this.transfers.length > MAX_TRANSFERS) {
      this.transfers = this.transfers.slice(0, MAX_TRANSFERS);
    }
    this.persist();
  }

  findRecent(limit = 20): Transfer[] {
    return this.transfers.slice(0, limit);
  }

  findAll(): Transfer[] {
    return this.transfers;
  }

  private persist(): void {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.transfers), 'utf8');
    } catch {}
  }
}
