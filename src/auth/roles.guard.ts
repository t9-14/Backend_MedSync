import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, MedSyncRole } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<MedSyncRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!required?.length) return true;
    const roles = context.switchToHttp().getRequest().user?.roles as MedSyncRole[] | undefined;
    if (roles?.some((role) => required.includes(role))) return true;
    throw new ForbiddenException('Your MedSync role cannot access this resource');
  }
}
