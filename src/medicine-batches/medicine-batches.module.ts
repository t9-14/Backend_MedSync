import { Module } from '@nestjs/common';
import { MedicineBatchesController } from './medicine-batches.controller';
import { MedicineBatchesService } from './medicine-batches.service';

@Module({
  controllers: [MedicineBatchesController],
  providers: [MedicineBatchesService],
})
export class MedicineBatchesModule {}
