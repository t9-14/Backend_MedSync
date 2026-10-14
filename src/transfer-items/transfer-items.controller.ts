import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { TransferItemsService } from './transfer-items.service';

@Controller('transfer-items')
export class TransferItemsController {
  constructor(private readonly transferItemsService: TransferItemsService) {}

  @Get()
  findAll(@Query('transfer_id') transferId?: string) {
    if (transferId === undefined) return this.transferItemsService.findAll();
    const parsedId = Number(transferId);
    if (!Number.isSafeInteger(parsedId) || parsedId < 1) {
      throw new BadRequestException('transfer_id must be a positive integer');
    }
    return this.transferItemsService.findAll(parsedId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.transferItemsService.findOne(id); }

  @Post()
  create(@Body() body: any) { return this.transferItemsService.create(body); }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.transferItemsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.transferItemsService.remove(id); }
}
