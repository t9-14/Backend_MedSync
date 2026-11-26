import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { CreateHealthCenterDto } from './dto/create-health-center.dto';
import { HealthCenterStatusDto } from './dto/health-center-status.dto';
import { HealthCentersService } from './health-centers.service';

@Controller('health-centers')
export class HealthCentersController {
  constructor(private readonly centers: HealthCentersService) {}

  @Get()
  list(@Req() request: any) { return this.centers.list(request.supabase); }

  @Roles('system_administrator')
  @Post()
  create(@Req() request: any, @Body() input: CreateHealthCenterDto) { return this.centers.create(request.supabase, input); }

  @Roles('system_administrator')
  @Patch(':id/status')
  setStatus(@Req() request: any, @Param('id', ParseUUIDPipe) id: string, @Body() input: HealthCenterStatusDto) {
    return this.centers.setStatus(request.supabase, id, input.status);
  }
}
