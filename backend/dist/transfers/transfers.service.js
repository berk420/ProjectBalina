"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransfersService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const STORE_PATH = path.resolve(process.cwd(), 'transfers.json');
const MAX_TRANSFERS = 100;
let TransfersService = class TransfersService {
    constructor() {
        this.transfers = [];
    }
    onModuleInit() {
        try {
            if (fs.existsSync(STORE_PATH)) {
                const raw = fs.readFileSync(STORE_PATH, 'utf8');
                this.transfers = JSON.parse(raw);
            }
        }
        catch {
            this.transfers = [];
        }
    }
    save(transfer) {
        if (this.transfers.some(t => t.txHash === transfer.txHash))
            return;
        this.transfers.unshift(transfer);
        if (this.transfers.length > MAX_TRANSFERS) {
            this.transfers = this.transfers.slice(0, MAX_TRANSFERS);
        }
        this.persist();
    }
    findRecent(limit = 20) {
        return this.transfers.slice(0, limit);
    }
    findAll() {
        return this.transfers;
    }
    persist() {
        try {
            fs.writeFileSync(STORE_PATH, JSON.stringify(this.transfers), 'utf8');
        }
        catch { }
    }
};
exports.TransfersService = TransfersService;
exports.TransfersService = TransfersService = __decorate([
    (0, common_1.Injectable)()
], TransfersService);
//# sourceMappingURL=transfers.service.js.map