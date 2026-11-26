import { Body, Controller, Get, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { CreateMedicineBatchDto } from './dto/create-medicine-batch.dto';
import { MedicineBatchesService } from './medicine-batches.service';

@Controller('medicine-batches')
export class MedicineBatchesController {
  constructor(private readonly batches: MedicineBatchesService) {}

  @Get()
  list(@Req() request: any, @Query('centerId', new ParseUUIDPipe({ optional: true })) centerId?: string, @Query('medicineId', new ParseUUIDPipe({ optional: true })) medicineId?: string) {
    return this.batches.list(request.supabase, centerId, medicineId);
  }

  @Roles('system_administrator', 'center_manager', 'inventory_staff')
  @Post()
  create(@Req() request: any, @Body() input: CreateMedicineBatchDto) { return this.batches.create(request.supabase, input); }
}
