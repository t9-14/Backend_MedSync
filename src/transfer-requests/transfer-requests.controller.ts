import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { CreateRedistributionRequestDto } from './dto/create-redistribution-request.dto';
import { RedistributionActionDto } from './dto/redistribution-action.dto';
import { TransferRequestsService } from './transfer-requests.service';

@Controller('redistribution-requests')
export class TransferRequestsController {
  constructor(private readonly requests: TransferRequestsService) {}

  @Get()
  list(@Req() request: any, @Query('centerId', new ParseUUIDPipe({ optional: true })) centerId?: string) { return this.requests.list(request.supabase, centerId); }

  @Get('stock-availability')
  stockAvailability(@Req() request: any, @Query('centerId', ParseUUIDPipe) centerId: string) { return this.requests.stockAvailability(request.supabase, centerId); }

  @Roles('system_administrator', 'center_manager', 'inventory_staff')
  @Post()
  create(@Req() request: any, @Body() input: CreateRedistributionRequestDto) { return this.requests.create(request.supabase, input); }

  @Roles('system_administrator', 'center_manager', 'inventory_staff')
  @Patch(':id/status')
  transition(@Req() request: any, @Param('id', ParseUUIDPipe) id: string, @Body() input: RedistributionActionDto) {
    return this.requests.transition(request.supabase, id, input.action);
  }
}
