import { Module } from '@nestjs/common';
import { DisposalCertificatesController } from './disposal-certificates.controller';
import { DisposalCertificatesService } from './disposal-certificates.service';

@Module({
  controllers: [DisposalCertificatesController],
  providers: [DisposalCertificatesService],
})
export class DisposalCertificatesModule {}
