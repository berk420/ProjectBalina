import { Module } from '@nestjs/common';
import { EthereumService } from './ethereum.service';
import { TransfersModule } from '../transfers/transfers.module';

@Module({
  imports: [TransfersModule],
  providers: [EthereumService],
  exports: [EthereumService],
})
export class EthereumModule {}
