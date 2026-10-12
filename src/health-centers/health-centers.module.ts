import { Module } from '@nestjs/common';
import { HealthCentersController } from './health-centers.controller';
import { HealthCentersService } from './health-centers.service';

@Module({
  controllers: [HealthCentersController],
  providers: [HealthCentersService],
})
export class HealthCentersModule {}
