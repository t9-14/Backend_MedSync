import { Module } from '@nestjs/common';
import { TransferItemsController } from './transfer-items.controller';
import { TransferItemsService } from './transfer-items.service';

@Module({
  controllers: [TransferItemsController],
  providers: [TransferItemsService],
})
export class TransferItemsModule {}
