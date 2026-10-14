import { Module } from '@nestjs/common';
import { TransferRequestsController } from './transfer-requests.controller';
import { TransferRequestsService } from './transfer-requests.service';

@Module({
  controllers: [TransferRequestsController],
  providers: [TransferRequestsService],
})
export class TransferRequestsModule {}
