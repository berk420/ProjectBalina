"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransfersService = void 0;
const common_1 = require("@nestjs/common");
let TransfersService = class TransfersService {
    constructor() {
        this.transfers = [];
        this.MAX_TRANSFERS = 100;
    }
    save(transfer) {
        this.transfers.unshift(transfer);
        if (this.transfers.length > this.MAX_TRANSFERS) {
            this.transfers = this.transfers.slice(0, this.MAX_TRANSFERS);
        }
    }
    findAll() {
        return this.transfers;
    }
    findRecent(limit = 20) {
        return this.transfers.slice(0, limit);
    }
};
exports.TransfersService = TransfersService;
exports.TransfersService = TransfersService = __decorate([
    (0, common_1.Injectable)()
], TransfersService);
//# sourceMappingURL=transfers.service.js.map