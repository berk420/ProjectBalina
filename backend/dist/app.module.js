"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ethereum_module_1 = require("./ethereum/ethereum.module");
const firebase_module_1 = require("./firebase/firebase.module");
const telegram_module_1 = require("./telegram/telegram.module");
const notifications_module_1 = require("./notifications/notifications.module");
const transfers_module_1 = require("./transfers/transfers.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            firebase_module_1.FirebaseModule,
            telegram_module_1.TelegramModule,
            notifications_module_1.NotificationsModule,
            transfers_module_1.TransfersModule,
            ethereum_module_1.EthereumModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map