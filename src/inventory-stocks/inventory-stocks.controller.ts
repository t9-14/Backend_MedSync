import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { InventoryStocksService } from './inventory-stocks.service';

function optionalPositiveId(value: string | undefined, field: string): number | undefined {
  if (value === undefined) return undefined;
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new BadRequestException(`${field} must be a positive integer`);
  return id;
}

@Controller('inventory-stocks')
export class InventoryStocksController {
  constructor(private readonly stocksService: InventoryStocksService) {}

  @Get()
  findAll(@Query('center_id') centerId?: string, @Query('batch_id') batchId?: string) {
    return this.stocksService.findAll(
      optionalPositiveId(centerId, 'center_id'),
      optionalPositiveId(batchId, 'batch_id'),
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stocksService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.stocksService.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.stocksService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stocksService.remove(id);
  }
}
