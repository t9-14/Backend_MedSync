import { Controller, Get, Req } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('me')
  me(@Req() request: any) {
    return { user: { id: request.user.id, email: request.user.email, fullName: request.user.fullName, roles: request.user.roles, memberships: request.user.memberships } };
  }
}
