import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from '../database/database.service';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly database: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) return true;

    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    const match = typeof authorization === 'string' && authorization.match(/^Bearer\s+([^\s]+)$/i);
    if (!match) throw new UnauthorizedException('A valid Supabase access token is required');

    const token = match[1];
    const supabase = this.database.forUser(token);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) throw new UnauthorizedException('Invalid or expired access token');

    const userId = data.user.id;
    const [profileResult, adminResult, membershipResult] = await Promise.all([
      supabase.from('profiles').select('full_name, account_status').eq('user_id', userId).maybeSingle(),
      supabase.from('system_administrators').select('user_id').eq('user_id', userId).maybeSingle(),
      supabase.from('center_memberships')
        .select('center_id, role, health_centers!inner(name, barangay, status)')
        .eq('user_id', userId).eq('status', 'active').eq('health_centers.status', 'active'),
    ]);

    if (profileResult.error || adminResult.error || membershipResult.error) {
      throw new UnauthorizedException('Unable to verify the user account and role');
    }
    if (profileResult.data?.account_status !== 'active') throw new UnauthorizedException('This account is not active');

    const memberships = membershipResult.data ?? [];
    const roles = [
      ...(adminResult.data ? ['system_administrator'] : []),
      ...(memberships.some((membership) => membership.role === 'manager') ? ['center_manager'] : []),
      ...(memberships.some((membership) => membership.role === 'staff') ? ['inventory_staff'] : []),
    ];
    if (roles.length === 0) throw new UnauthorizedException('No active MedSync role is assigned');

    request.user = { id: userId, email: data.user.email ?? null, fullName: profileResult.data.full_name, roles, memberships };
    request.supabase = supabase;
    return true;
  }
}
