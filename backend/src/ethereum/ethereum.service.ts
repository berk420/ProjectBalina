import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ethers } from 'ethers';
import { FirebaseService } from '../firebase/firebase.service';
import { TelegramService } from '../telegram/telegram.service';
import { TransfersService, Transfer } from '../transfers/transfers.service';
import { v4 as uuidv4 } from 'uuid';

const USDT_ABI = [
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

const USDT_DECIMALS = 6;
const FCM_TOPIC = 'whale-alerts';

@Injectable()
export class EthereumService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EthereumService.name);
  private provider: ethers.WebSocketProvider | ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private reconnectTimer: NodeJS.Timeout;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly telegramService: TelegramService,
    private readonly transfersService: TransfersService,
  ) {}

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.disconnect();
  }

  private connect() {
    const alchemyUrl = process.env.ALCHEMY_URL || '';
    const contractAddress = process.env.USDT_CONTRACT || '0xdAC17F958D2ee523a2206206994597C13D831ec7';

    try {
      // Use WebSocket if available, fallback to HTTP polling
      const wsUrl = alchemyUrl.replace('https://', 'wss://');
      this.provider = new ethers.WebSocketProvider(wsUrl);
      this.logger.log('Connected via WebSocket');
    } catch {
      this.provider = new ethers.JsonRpcProvider(alchemyUrl);
      this.logger.log('Connected via HTTP RPC');
    }

    this.contract = new ethers.Contract(contractAddress, USDT_ABI, this.provider);

    this.contract.on('Transfer', this.handleTransferEvent.bind(this));

    this.provider.on('error', (err) => {
      this.logger.error('Provider error, reconnecting...', err.message);
      this.scheduleReconnect();
    });

    this.logger.log(`Listening for USDT transfers ≥ ${process.env.USDT_THRESHOLD || 100000} USDT`);
  }

  private async handleTransferEvent(
    from: string,
    to: string,
    value: bigint,
    event: any,
  ) {
    try {
      const threshold = BigInt(
        (parseFloat(process.env.USDT_THRESHOLD || '100000') * Math.pow(10, USDT_DECIMALS)).toFixed(0),
      );

      if (value < threshold) return;

      const amountFormatted = (Number(value) / Math.pow(10, USDT_DECIMALS)).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      // ethers v6: event is ContractEventPayload, log is in event.log
      const log = event?.log || event;
      const txHash: string = log?.transactionHash || log?.hash || 'unknown';
      const blockNumber: number = log?.blockNumber || 0;

      this.logger.log(`🐳 Whale transfer: ${amountFormatted} USDT | TX: ${txHash}`);

      const transfer: Transfer = {
        id: uuidv4(),
        from,
        to,
        amount: value.toString(),
        amountFormatted,
        txHash,
        blockNumber,
        timestamp: Date.now(),
      };

      this.transfersService.save(transfer);

      const notifData: Record<string, string> = {
        from,
        to,
        amount: value.toString(),
        amountFormatted,
        txHash,
        blockNumber: blockNumber.toString(),
        timestamp: transfer.timestamp.toString(),
      };

      const notification = {
        title: '🐳 USDT Balina Transferi!',
        body: `${amountFormatted} USDT transfer edildi`,
      };

      // Send FCM + Telegram in parallel
      await Promise.all([
        this.firebaseService.sendToTopic(FCM_TOPIC, notifData, notification),
        this.telegramService.sendGroupMessage(
          this.telegramService.formatWhaleAlert(from, to, amountFormatted, txHash),
        ),
      ]);
    } catch (err) {
      this.logger.error('Error handling transfer event', err.message);
    }
  }

  private scheduleReconnect() {
    clearTimeout(this.reconnectTimer);
    this.disconnect();
    this.reconnectTimer = setTimeout(() => {
      this.logger.log('Reconnecting...');
      this.connect();
    }, 5000);
  }

  private disconnect() {
    try {
      if (this.contract) this.contract.removeAllListeners();
      if (this.provider) this.provider.destroy();
    } catch {}
  }

  getStatus(): { connected: boolean; contractAddress: string; threshold: string } {
    return {
      connected: !!this.provider,
      contractAddress: process.env.USDT_CONTRACT || '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      threshold: `${process.env.USDT_THRESHOLD || 100000} USDT`,
    };
  }
}
