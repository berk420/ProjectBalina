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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
const telegram_service_1 = require("../telegram/telegram.service");
const FCM_TOPIC = 'whale-alerts';
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(firebaseService, telegramService) {
        this.firebaseService = firebaseService;
        this.telegramService = telegramService;
        this.logger = new common_1.Logger(NotificationsService_1.name);
        this.tokens = new Set();
    }
    async registerToken(token) {
        this.tokens.add(token);
        const success = await this.firebaseService.subscribeToTopic(token, FCM_TOPIC);
        this.logger.log(`Token registered: ${token.slice(0, 20)}...`);
        return { success };
    }
    async unregisterToken(token) {
        this.tokens.delete(token);
        const success = await this.firebaseService.unsubscribeFromTopic(token, FCM_TOPIC);
        return { success };
    }
    async getTelegramInviteLink(phoneNumber) {
        this.logger.log(`Telegram invite requested for: ${phoneNumber}`);
        const inviteLink = await this.telegramService.createInviteLink();
        if (inviteLink) {
            return {
                inviteLink,
                message: 'Aşağıdaki linke tıklayarak Telegram grubuna katılabilirsiniz.',
            };
        }
        return {
            inviteLink: null,
            message: 'Davet linki oluşturulamadı. Lütfen tekrar deneyin.',
        };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        telegram_service_1.TelegramService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map