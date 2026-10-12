import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { MedicinesService } from './medicines.service';

@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Get()
  findAll() { return this.medicinesService.findAll(); }

  @Post()
  create(@Body() medicine: any) { return this.medicinesService.create(medicine); }

  @Put(':id')
  update(@Param('id') id: string, @Body() medicine: any) { return this.medicinesService.update(+id, medicine); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.medicinesService.remove(+id); }
}