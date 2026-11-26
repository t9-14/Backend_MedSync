import { Body, Controller, Get, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
import { InventoryStocksService } from './inventory-stocks.service';

@Controller()
export class InventoryStocksController {
  constructor(private readonly inventory: InventoryStocksService) {}

  @Get('inventory-stocks')
  list(@Req() request: any, @Query('centerId', new ParseUUIDPipe({ optional: true })) centerId?: string) { return this.inventory.list(request.supabase, centerId); }

  @Get('stock-transactions')
  transactions(@Req() request: any, @Query('centerId', new ParseUUIDPipe({ optional: true })) centerId?: string) { return this.inventory.transactions(request.supabase, centerId); }

  @Roles('system_administrator', 'center_manager', 'inventory_staff')
  @Post('stock-transactions')
  createTransaction(@Req() request: any, @Body() input: CreateStockTransactionDto) {
    return this.inventory.createTransaction(request.supabase, input);
  }
}
