import { AuthController } from './auth.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AuthController],
})
export class AuthModule {}
