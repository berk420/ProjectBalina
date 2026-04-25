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
const POLL_INTERVAL_MS = 60_000;

@Injectable()
export class EthereumService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EthereumService.name);
  private provider: ethers.JsonRpcProvider;
  private iface: ethers.Interface;
  private pollTimer: NodeJS.Timeout;
  private lastBlock = 0;
  private readonly processedTxHashes = new Set<string>();

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly telegramService: TelegramService,
    private readonly transfersService: TransfersService,
  ) {}

  onModuleInit() {
    const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.iface = new ethers.Interface(USDT_ABI);
    this.logger.log(`Ethereum mainnet bağlantısı kuruldu → ${rpcUrl}`);
    this.logger.log(`USDT Transfer event'leri dinleniyor ≥ ${process.env.USDT_THRESHOLD || 100000} USDT`);
    this.poll();
    this.pollTimer = setInterval(() => this.poll(), POLL_INTERVAL_MS);
  }

  onModuleDestroy() {
    clearInterval(this.pollTimer);
    this.provider.destroy();
  }

  private async poll() {
    const contractAddress = process.env.USDT_CONTRACT || '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    const threshold = BigInt(
      (parseFloat(process.env.USDT_THRESHOLD || '100000') * Math.pow(10, USDT_DECIMALS)).toFixed(0),
    );

    try {
      const latestBlock = await this.provider.getBlockNumber();

      if (this.lastBlock === 0) {
        this.lastBlock = latestBlock - 5;
      }

      if (this.lastBlock >= latestBlock) return;

      const logs = await this.provider.getLogs({
        address: contractAddress,
        topics: [ethers.id('Transfer(address,address,uint256)')],
        fromBlock: this.lastBlock + 1,
        toBlock: latestBlock,
      });

      this.lastBlock = latestBlock;

      for (const log of logs) {
        const parsed = this.iface.parseLog(log);
        if (!parsed) continue;

        const from: string = parsed.args[0];
        const to: string = parsed.args[1];
        const value: bigint = parsed.args[2];

        if (value < threshold) continue;

        await this.handleTransferEvent(from, to, value, log);
      }
    } catch (err) {
      this.logger.error('Transfer event poll hatası', err.message);
    }
  }

  private async handleTransferEvent(
    from: string,
    to: string,
    value: bigint,
    log: ethers.Log,
  ) {
    const txHash = log.transactionHash;
    const blockNumber = log.blockNumber;

    const dedupKey = `${txHash}-${from}-${to}-${value.toString()}`;
    if (this.processedTxHashes.has(dedupKey)) return;
    this.processedTxHashes.add(dedupKey);
    if (this.processedTxHashes.size > 500) {
      this.processedTxHashes.delete(this.processedTxHashes.values().next().value);
    }

    const amountFormatted = (Number(value) / Math.pow(10, USDT_DECIMALS)).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    this.logger.log(`🐳 Balina transferi: ${amountFormatted} USDT | TX: ${txHash}`);

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
      senderAddress: from,
      receiverAddress: to,
      amount: value.toString(),
      amountFormatted,
      txHash,
      blockNumber: blockNumber.toString(),
      timestamp: transfer.timestamp.toString(),
    };

    await Promise.all([
      this.firebaseService.sendToTopic(FCM_TOPIC, notifData, {
        title: '🐳 USDT Balina Transferi!',
        body: `${amountFormatted} USDT transfer edildi`,
      }),
      this.telegramService.sendGroupMessage(
        this.telegramService.formatWhaleAlert(from, to, amountFormatted, txHash),
      ),
    ]);
  }

  getStatus(): { connected: boolean; contractAddress: string; threshold: string } {
    return {
      connected: !!this.provider,
      contractAddress: process.env.USDT_CONTRACT || '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      threshold: `${process.env.USDT_THRESHOLD || 100000} USDT`,
    };
  }
}
