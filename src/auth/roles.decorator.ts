import { SetMetadata } from '@nestjs/common';

export const MEDSYNC_ROLES = ['system_administrator', 'center_manager', 'inventory_staff'] as const;
export type MedSyncRole = (typeof MEDSYNC_ROLES)[number];
export const ROLES_KEY = 'medsync.roles';
export const Roles = (...roles: MedSyncRole[]) => SetMetadata(ROLES_KEY, roles);
