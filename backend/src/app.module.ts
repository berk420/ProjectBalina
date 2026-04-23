import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EthereumModule } from './ethereum/ethereum.module';
import { FirebaseModule } from './firebase/firebase.module';
import { TelegramModule } from './telegram/telegram.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TransfersModule } from './transfers/transfers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FirebaseModule,
    TelegramModule,
    NotificationsModule,
    TransfersModule,
    EthereumModule,
  ],
})
export class AppModule {}
