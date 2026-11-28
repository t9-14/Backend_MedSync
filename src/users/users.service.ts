import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { throwDatabaseError } from '../common/database-errors';
import { fetchAllRows } from '../common/fetch-all-rows';
import { SetCenterMembershipDto } from './dto/set-center-membership.dto';

@Injectable()
export class UsersService {
  async profiles(db: SupabaseClient) {
    const query = db.from('profiles').select('user_id,full_name,account_status,created_at').order('full_name');
    return fetchAllRows(query);
  }

  async updateProfileName(db: SupabaseClient, userId: string, fullName: string) {
    const { error } = await db.rpc('admin_update_profile_name', { p_user_id: userId, p_full_name: fullName });
    if (error) throwDatabaseError(error);
    return { userId, fullName: fullName.trim() };
  }

  async memberships(db: SupabaseClient, centerId?: string) {
    let query = db.from('center_memberships')
      .select('id,user_id,center_id,role,status,created_at,profile:profiles!center_memberships_user_id_fkey(full_name,account_status),center:health_centers!center_memberships_center_id_fkey(name,barangay)')
      .order('created_at', { ascending: false });
    if (centerId) query = query.eq('center_id', centerId);
    return fetchAllRows(query);
  }

  async setMembership(db: SupabaseClient, input: SetCenterMembershipDto) {
    const { data, error } = await db.rpc('set_center_membership', {
      p_center_id: input.centerId, p_user_id: input.userId, p_role: input.role, p_status: input.status ?? 'active',
    });
    if (error) throwDatabaseError(error);
    return { id: data, centerId: input.centerId, userId: input.userId, role: input.role, status: input.status ?? 'active' };
  }
}
