"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EthereumService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthereumService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
const firebase_service_1 = require("../firebase/firebase.service");
const telegram_service_1 = require("../telegram/telegram.service");
const transfers_service_1 = require("../transfers/transfers.service");
const uuid_1 = require("uuid");
const USDT_ABI = [
    'event Transfer(address indexed from, address indexed to, uint256 value)',
];
const USDT_DECIMALS = 6;
const FCM_TOPIC = 'whale-alerts';
const POLL_INTERVAL_MS = 60_000;
let EthereumService = EthereumService_1 = class EthereumService {
    constructor(firebaseService, telegramService, transfersService) {
        this.firebaseService = firebaseService;
        this.telegramService = telegramService;
        this.transfersService = transfersService;
        this.logger = new common_1.Logger(EthereumService_1.name);
        this.lastBlock = 0;
        this.processedTxHashes = new Set();
    }
    onModuleInit() {
        const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        this.iface = new ethers_1.ethers.Interface(USDT_ABI);
        this.logger.log(`Ethereum mainnet bağlantısı kuruldu → ${rpcUrl}`);
        this.logger.log(`USDT Transfer event'leri dinleniyor ≥ ${process.env.USDT_THRESHOLD || 100000} USDT`);
        this.poll();
        this.pollTimer = setInterval(() => this.poll(), POLL_INTERVAL_MS);
    }
    onModuleDestroy() {
        clearInterval(this.pollTimer);
        this.provider.destroy();
    }
    async poll() {
        const contractAddress = process.env.USDT_CONTRACT || '0xdAC17F958D2ee523a2206206994597C13D831ec7';
        const threshold = BigInt((parseFloat(process.env.USDT_THRESHOLD || '100000') * Math.pow(10, USDT_DECIMALS)).toFixed(0));
        try {
            const latestBlock = await this.provider.getBlockNumber();
            if (this.lastBlock === 0) {
                this.lastBlock = latestBlock - 5;
            }
            if (this.lastBlock >= latestBlock)
                return;
            const logs = await this.provider.getLogs({
                address: contractAddress,
                topics: [ethers_1.ethers.id('Transfer(address,address,uint256)')],
                fromBlock: this.lastBlock + 1,
                toBlock: latestBlock,
            });
            this.lastBlock = latestBlock;
            for (const log of logs) {
                const parsed = this.iface.parseLog(log);
                if (!parsed)
                    continue;
                const from = parsed.args[0];
                const to = parsed.args[1];
                const value = parsed.args[2];
                if (value < threshold)
                    continue;
                await this.handleTransferEvent(from, to, value, log);
            }
        }
        catch (err) {
            this.logger.error('Transfer event poll hatası', err.message);
        }
    }
    async handleTransferEvent(from, to, value, log) {
        const txHash = log.transactionHash;
        const blockNumber = log.blockNumber;
        const dedupKey = `${txHash}-${from}-${to}-${value.toString()}`;
        if (this.processedTxHashes.has(dedupKey))
            return;
        this.processedTxHashes.add(dedupKey);
        if (this.processedTxHashes.size > 500) {
            this.processedTxHashes.delete(this.processedTxHashes.values().next().value);
        }
        const amountFormatted = (Number(value) / Math.pow(10, USDT_DECIMALS)).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        this.logger.log(`🐳 Balina transferi: ${amountFormatted} USDT | TX: ${txHash}`);
        const transfer = {
            id: (0, uuid_1.v4)(),
            from,
            to,
            amount: value.toString(),
            amountFormatted,
            txHash,
            blockNumber,
            timestamp: Date.now(),
        };
        this.transfersService.save(transfer);
        const notifData = {
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
            this.telegramService.sendGroupMessage(this.telegramService.formatWhaleAlert(from, to, amountFormatted, txHash)),
        ]);
    }
    getStatus() {
        return {
            connected: !!this.provider,
            contractAddress: process.env.USDT_CONTRACT || '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            threshold: `${process.env.USDT_THRESHOLD || 100000} USDT`,
        };
    }
};
exports.EthereumService = EthereumService;
exports.EthereumService = EthereumService = EthereumService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        telegram_service_1.TelegramService,
        transfers_service_1.TransfersService])
], EthereumService);
//# sourceMappingURL=ethereum.service.js.map