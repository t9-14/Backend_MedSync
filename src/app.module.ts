import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HealthCentersModule } from './health-centers/health-centers.module';
import { MedicinesModule } from './medicines/medicines.module';
import { MedicineBatchesModule } from './medicine-batches/medicine-batches.module';
import { InventoryStocksModule } from './inventory-stocks/inventory-stocks.module';
import { TransferRequestsModule } from './transfer-requests/transfer-requests.module';
import { TransferItemsModule } from './transfer-items/transfer-items.module';
import { DisposalCertificatesModule } from './disposal-certificates/disposal-certificates.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    HealthCentersModule,
    MedicinesModule,
    MedicineBatchesModule,
    InventoryStocksModule,
    TransferRequestsModule,
    TransferItemsModule,
    DisposalCertificatesModule,
  ],
})

export class AppModule {}
