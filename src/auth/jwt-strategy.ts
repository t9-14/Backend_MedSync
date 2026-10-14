import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

const accessSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
if (!accessSecret || accessSecret.length < 32) {
  throw new Error('JWT_ACCESS_TOKEN_SECRET must be set to at least 32 characters');
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: accessSecret!,
    });
  }

  async validate(payload: any) {
    // payload contains { sub, username, role }
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}
