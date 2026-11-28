import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { throwDatabaseError } from '../common/database-errors';
import { fetchAllRows } from '../common/fetch-all-rows';
import { CreateHealthCenterDto } from './dto/create-health-center.dto';

@Injectable()
export class HealthCentersService {
  async list(db: SupabaseClient) {
    const query = db.from('health_centers').select('id,name,barangay,contact_number,status,created_at').order('name');
    return fetchAllRows(query);
  }

  async create(db: SupabaseClient, input: CreateHealthCenterDto) {
    const { data, error } = await db.rpc('create_health_center', {
      p_name: input.name.trim(), p_barangay: input.barangay.trim(), p_contact_number: input.contactNumber?.trim() || null,
    });
    if (error) throwDatabaseError(error);
    return { id: data };
  }

  async setStatus(db: SupabaseClient, centerId: string, status: string) {
    const { error } = await db.rpc('set_health_center_status', { p_center_id: centerId, p_status: status });
    if (error) throwDatabaseError(error);
    return { id: centerId, status };
  }
}
