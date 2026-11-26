import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AccessTokenGuard } from './auth/access-token.guard';
import { RolesGuard } from './auth/roles.guard';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { MedicinesModule } from './medicines/medicines.module';
import { MedicineBatchesModule } from './medicine-batches/medicine-batches.module';
import { InventoryStocksModule } from './inventory-stocks/inventory-stocks.module';
import { TransferRequestsModule } from './transfer-requests/transfer-requests.module';
import { HealthCentersModule } from './health-centers/health-centers.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, HealthModule, HealthCentersModule, UsersModule, MedicinesModule, MedicineBatchesModule, InventoryStocksModule, TransferRequestsModule],
  providers: [
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule {}
