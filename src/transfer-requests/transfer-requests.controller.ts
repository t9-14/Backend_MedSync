import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { TransferRequestsService } from './transfer-requests.service';

@Controller('transfer-requests')
export class TransferRequestsController {
  constructor(private readonly transferRequestsService: TransferRequestsService) {}

  @Get()
  findAll() { return this.transferRequestsService.findAll(); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.transferRequestsService.findOne(id); }

  @Post()
  create(@Body() body: any) { return this.transferRequestsService.create(body); }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.transferRequestsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.transferRequestsService.remove(id); }
}
