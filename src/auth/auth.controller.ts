import { BadRequestException, Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

function credentials(body: any) {
  if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') {
    throw new BadRequestException('Username and password are required');
  }
  const username = body.username.trim();
  if (username.length < 3 || username.length > 50 || !/^[a-zA-Z0-9_.-]+$/.test(username)) {
    throw new BadRequestException('Username must be 3-50 characters and use letters, numbers, dot, dash, or underscore');
  }
  const passwordBytes = Buffer.byteLength(body.password, 'utf8');
  if (passwordBytes < 8 || passwordBytes > 72) {
    throw new BadRequestException('Password must be 8-72 bytes when UTF-8 encoded');
  }
  return { username, password: body.password };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() body: any) {
    const input = credentials(body);
    return this.authService.register(input.username, input.password);
  }

  @Public()
  @Post('login')
  async login(@Body() body: any) {
    const input = credentials(body);
    return this.authService.login(input.username, input.password);
  }

  @Post('logout')
  async logout(@Req() req: any) {
    await this.authService.logout(req.user.userId);
    return { ok: true };
  }

  @Public()
  @Post('refresh')
  refresh(@Body() body: any) {
    if (!body || typeof body.refreshToken !== 'string' || body.refreshToken.length > 4096) {
      throw new BadRequestException('Refresh token is required');
    }
    return this.authService.refreshTokens(body.refreshToken);
  }
}
