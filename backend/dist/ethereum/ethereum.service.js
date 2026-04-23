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
let EthereumService = EthereumService_1 = class EthereumService {
    constructor(firebaseService, telegramService, transfersService) {
        this.firebaseService = firebaseService;
        this.telegramService = telegramService;
        this.transfersService = transfersService;
        this.logger = new common_1.Logger(EthereumService_1.name);
    }
    onModuleInit() {
        this.connect();
    }
    onModuleDestroy() {
        this.disconnect();
    }
    connect() {
        const alchemyUrl = process.env.ALCHEMY_URL || '';
        const contractAddress = process.env.USDT_CONTRACT || '0xdAC17F958D2ee523a2206206994597C13D831ec7';
        try {
            const wsUrl = alchemyUrl.replace('https://', 'wss://');
            this.provider = new ethers_1.ethers.WebSocketProvider(wsUrl);
            this.logger.log('Connected via WebSocket');
        }
        catch {
            this.provider = new ethers_1.ethers.JsonRpcProvider(alchemyUrl);
            this.logger.log('Connected via HTTP RPC');
        }
        this.contract = new ethers_1.ethers.Contract(contractAddress, USDT_ABI, this.provider);
        this.contract.on('Transfer', this.handleTransferEvent.bind(this));
        this.provider.on('error', (err) => {
            this.logger.error('Provider error, reconnecting...', err.message);
            this.scheduleReconnect();
        });
        this.logger.log(`Listening for USDT transfers ≥ ${process.env.USDT_THRESHOLD || 100000} USDT`);
    }
    async handleTransferEvent(from, to, value, event) {
        try {
            const threshold = BigInt((parseFloat(process.env.USDT_THRESHOLD || '100000') * Math.pow(10, USDT_DECIMALS)).toFixed(0));
            if (value < threshold)
                return;
            const amountFormatted = (Number(value) / Math.pow(10, USDT_DECIMALS)).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            const log = event?.log || event;
            const txHash = log?.transactionHash || log?.hash || 'unknown';
            const blockNumber = log?.blockNumber || 0;
            this.logger.log(`🐳 Whale transfer: ${amountFormatted} USDT | TX: ${txHash}`);
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
            await Promise.all([
                this.firebaseService.sendToTopic(FCM_TOPIC, notifData, notification),
                this.telegramService.sendGroupMessage(this.telegramService.formatWhaleAlert(from, to, amountFormatted, txHash)),
            ]);
        }
        catch (err) {
            this.logger.error('Error handling transfer event', err.message);
        }
    }
    scheduleReconnect() {
        clearTimeout(this.reconnectTimer);
        this.disconnect();
        this.reconnectTimer = setTimeout(() => {
            this.logger.log('Reconnecting...');
            this.connect();
        }, 5000);
    }
    disconnect() {
        try {
            if (this.contract)
                this.contract.removeAllListeners();
            if (this.provider)
                this.provider.destroy();
        }
        catch { }
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