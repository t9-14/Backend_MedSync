import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { HealthCentersService } from './health-centers.service';

@Controller('health-centers')
export class HealthCentersController {
  constructor(private readonly healthCentersService: HealthCentersService) {}

  @Get()
  findAll() { return this.healthCentersService.findAll(); }

  @Post()
  create(@Body() center: any) { return this.healthCentersService.create(center); }

  @Put(':id')
  update(@Param('id') id: string, @Body() center: any) { return this.healthCentersService.update(+id, center); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.healthCentersService.remove(+id); }
}