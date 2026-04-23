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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notifications_service_1 = require("./notifications.service");
const register_token_dto_1 = require("./dto/register-token.dto");
const join_telegram_dto_1 = require("./dto/join-telegram.dto");
const transfers_service_1 = require("../transfers/transfers.service");
let NotificationsController = class NotificationsController {
    constructor(notificationsService, transfersService) {
        this.notificationsService = notificationsService;
        this.transfersService = transfersService;
    }
    async registerToken(dto) {
        return this.notificationsService.registerToken(dto.token);
    }
    async unregisterToken(dto) {
        return this.notificationsService.unregisterToken(dto.token);
    }
    async joinTelegram(dto) {
        return this.notificationsService.getTelegramInviteLink(dto.phoneNumber);
    }
    getTransfers(limit) {
        const n = limit ? parseInt(limit, 10) : 20;
        return this.transfersService.findRecent(n);
    }
    health() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)('register-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Register FCM device token for whale alerts' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_token_dto_1.RegisterTokenDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "registerToken", null);
__decorate([
    (0, common_1.Delete)('unregister-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Unregister FCM device token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_token_dto_1.RegisterTokenDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "unregisterToken", null);
__decorate([
    (0, common_1.Post)('join-telegram'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Telegram group invite link' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [join_telegram_dto_1.JoinTelegramDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "joinTelegram", null);
__decorate([
    (0, common_1.Get)('transfers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent whale transfers' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getTransfers", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "health", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        transfers_service_1.TransfersService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map