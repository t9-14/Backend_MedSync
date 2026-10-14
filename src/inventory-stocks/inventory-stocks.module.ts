import { Module } from '@nestjs/common';
import { InventoryStocksController } from './inventory-stocks.controller';
import { InventoryStocksService } from './inventory-stocks.service';

@Module({
  controllers: [InventoryStocksController],
  providers: [InventoryStocksService],
})
export class InventoryStocksModule {}
