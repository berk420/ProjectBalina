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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TelegramService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let TelegramService = TelegramService_1 = class TelegramService {
    constructor() {
        this.logger = new common_1.Logger(TelegramService_1.name);
        this.token = process.env.TELEGRAM_BOT_TOKEN || '';
        this.groupChatId = process.env.TELEGRAM_CHAT_ID_GROUP || '';
        this.baseUrl = `https://api.telegram.org/bot${this.token}`;
    }
    async sendGroupMessage(text) {
        if (!this.token || !this.groupChatId) {
            this.logger.warn('Telegram credentials not configured');
            return false;
        }
        try {
            await axios_1.default.post(`${this.baseUrl}/sendMessage`, {
                chat_id: this.groupChatId,
                text,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            });
            this.logger.log('Telegram group message sent');
            return true;
        }
        catch (err) {
            this.logger.error('Telegram send failed', err.response?.data || err.message);
            return false;
        }
    }
    async sendDirectMessage(chatId, text) {
        if (!this.token)
            return false;
        try {
            await axios_1.default.post(`${this.baseUrl}/sendMessage`, {
                chat_id: chatId,
                text,
                parse_mode: 'HTML',
            });
            return true;
        }
        catch (err) {
            this.logger.error('Telegram DM failed', err.response?.data || err.message);
            return false;
        }
    }
    async createInviteLink() {
        if (!this.token || !this.groupChatId)
            return null;
        try {
            const resp = await axios_1.default.post(`${this.baseUrl}/createChatInviteLink`, {
                chat_id: this.groupChatId,
                member_limit: 1,
                expire_date: Math.floor(Date.now() / 1000) + 3600 * 24,
            });
            return resp.data?.result?.invite_link || null;
        }
        catch (err) {
            this.logger.error('Telegram invite link failed', err.response?.data || err.message);
            return null;
        }
    }
    formatWhaleAlert(from, to, amount, txHash) {
        const shortFrom = `${from.slice(0, 6)}...${from.slice(-4)}`;
        const shortTo = `${to.slice(0, 6)}...${to.slice(-4)}`;
        const shortTx = `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;
        return (`🐳 <b>USDT Büyük Transfer Tespit Edildi!</b>\n\n` +
            `💰 <b>Miktar:</b> ${amount} USDT\n` +
            `📤 <b>Gönderen:</b> <code>${shortFrom}</code>\n` +
            `📥 <b>Alıcı:</b> <code>${shortTo}</code>\n` +
            `🔗 <b>TX Hash:</b> <code>${shortTx}</code>\n` +
            `🔍 <a href="https://etherscan.io/tx/${txHash}">Etherscan'da Görüntüle</a>`);
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = TelegramService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map