import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { MedicinesService } from './medicines.service';

@Controller('medicines')
export class MedicinesController {
  constructor(private readonly medicines: MedicinesService) {}

  @Get()
  list(@Req() request: any, @Query('search') search?: string) { return this.medicines.list(request.supabase, search); }

  @Roles('system_administrator')
  @Post()
  create(@Req() request: any, @Body() input: CreateMedicineDto) { return this.medicines.create(request.supabase, input); }
}
