import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  async register(username: string, password: string) {
    return this.usersService.createUser(username, password);
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return this.issueTokens(user);
  }

  async logout(userId: number) {
    await this.usersService.setRefreshToken(userId, null);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshSecret()) as jwt.JwtPayload;
      if (typeof decoded.sub !== 'number') throw new Error('Invalid token subject');
      const user = await this.usersService.findByRefreshToken(refreshToken);
      if (!user || user.id !== decoded.sub) throw new Error('Refresh token revoked');
      return await this.issueTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async issueTokens(user: { id: number; username: string; role: string }) {
    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = jwt.sign(payload, this.refreshSecret(), {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
    await this.usersService.setRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  private refreshSecret() {
    const secret = process.env.JWT_REFRESH_TOKEN_SECRET;
    if (!secret || secret.length < 32) throw new Error('JWT_REFRESH_TOKEN_SECRET must be at least 32 characters');
    return secret;
  }
}
