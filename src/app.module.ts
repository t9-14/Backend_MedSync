import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HealthCentersModule } from './health-centers/health-centers.module';
import { MedicinesModule } from './medicines/medicines.module';
import { MedicineBatchesModule } from './medicine-batches/medicine-batches.module';
import { InventoryStocksModule } from './inventory-stocks/inventory-stocks.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    HealthCentersModule,
    MedicinesModule,
    MedicineBatchesModule,
    InventoryStocksModule,
  ],
})

export class AppModule {}
