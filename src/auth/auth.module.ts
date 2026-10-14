import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt-strategy';
import { AccessTokenGuard } from './access-token.guard';

const accessSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
if (!accessSecret || accessSecret.length < 32) {
  throw new Error('JWT_ACCESS_TOKEN_SECRET must be set to at least 32 characters');
}
const refreshSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
if (!refreshSecret || refreshSecret.length < 32) {
  throw new Error('JWT_REFRESH_TOKEN_SECRET must be set to at least 32 characters');
}

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: accessSecret,
      signOptions: {
        expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN || '900s') as any,
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, { provide: APP_GUARD, useClass: AccessTokenGuard }],
  controllers: [AuthController],
})
export class AuthModule {}
