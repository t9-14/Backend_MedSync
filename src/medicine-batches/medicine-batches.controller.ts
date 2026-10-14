import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { MedicineBatchesService } from './medicine-batches.service';

@Controller('medicine-batches')
export class MedicineBatchesController {
  constructor(private readonly batchesService: MedicineBatchesService) {}

  @Get()
  findAll(@Query('medicine_id') medicineId?: string) {
    if (medicineId === undefined) return this.batchesService.findAll();
    const parsedId = Number(medicineId);
    if (!Number.isSafeInteger(parsedId) || parsedId < 1) {
      throw new BadRequestException('medicine_id must be a positive integer');
    }
    return this.batchesService.findAll(parsedId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.batchesService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.batchesService.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.batchesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.batchesService.remove(id);
  }
}
