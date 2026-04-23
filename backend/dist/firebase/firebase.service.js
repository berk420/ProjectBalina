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
var FirebaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const admin = __importStar(require("firebase-admin"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let FirebaseService = FirebaseService_1 = class FirebaseService {
    constructor() {
        this.logger = new common_1.Logger(FirebaseService_1.name);
    }
    onModuleInit() {
        try {
            const sdkPath = path.resolve(process.env.FIREBASE_ADMIN_SDK_PATH || './firebase-adminsdk.json');
            const serviceAccount = JSON.parse(fs.readFileSync(sdkPath, 'utf8'));
            this.app = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            this.logger.log('Firebase Admin SDK initialized');
        }
        catch (err) {
            this.logger.error('Firebase init failed', err.message);
        }
    }
    async sendToTopic(topic, data, notification) {
        try {
            const message = {
                topic,
                notification,
                data,
                android: { priority: 'high' },
                apns: { payload: { aps: { sound: 'default' } } },
                webpush: {
                    notification: { ...notification, icon: '/icon.png' },
                    headers: { Urgency: 'high' },
                },
            };
            const messageId = await admin.messaging().send(message);
            this.logger.log(`FCM message sent to topic [${topic}]: ${messageId}`);
            return messageId;
        }
        catch (err) {
            this.logger.error('FCM send failed', err.message);
            return null;
        }
    }
    async sendToToken(token, data, notification) {
        try {
            const message = {
                token,
                notification,
                data,
                android: { priority: 'high' },
                webpush: {
                    notification: { ...notification, icon: '/icon.png' },
                    headers: { Urgency: 'high' },
                },
            };
            const messageId = await admin.messaging().send(message);
            this.logger.log(`FCM message sent to token: ${messageId}`);
            return messageId;
        }
        catch (err) {
            this.logger.error('FCM send to token failed', err.message);
            return null;
        }
    }
    async subscribeToTopic(token, topic) {
        try {
            await admin.messaging().subscribeToTopic([token], topic);
            this.logger.log(`Token subscribed to topic [${topic}]`);
            return true;
        }
        catch (err) {
            this.logger.error('Subscribe to topic failed', err.message);
            return false;
        }
    }
    async unsubscribeFromTopic(token, topic) {
        try {
            await admin.messaging().unsubscribeFromTopic([token], topic);
            return true;
        }
        catch (err) {
            this.logger.error('Unsubscribe from topic failed', err.message);
            return false;
        }
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = FirebaseService_1 = __decorate([
    (0, common_1.Injectable)()
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map