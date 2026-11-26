import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { SetCenterMembershipDto } from './dto/set-center-membership.dto';
import { UpdateProfileNameDto } from './dto/update-profile-name.dto';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Roles('system_administrator', 'center_manager')
  @Get('profiles')
  profiles(@Req() request: any) { return this.users.profiles(request.supabase); }

  @Roles('system_administrator')
  @Patch('profiles/:userId/name')
  updateProfileName(@Req() request: any, @Param('userId', ParseUUIDPipe) userId: string, @Body() input: UpdateProfileNameDto) {
    return this.users.updateProfileName(request.supabase, userId, input.fullName);
  }

  @Roles('system_administrator', 'center_manager')
  @Get('center-memberships')
  memberships(@Req() request: any, @Query('centerId', new ParseUUIDPipe({ optional: true })) centerId?: string) { return this.users.memberships(request.supabase, centerId); }

  @Roles('system_administrator', 'center_manager')
  @Post('center-memberships')
  setMembership(@Req() request: any, @Body() input: SetCenterMembershipDto) { return this.users.setMembership(request.supabase, input); }
}
