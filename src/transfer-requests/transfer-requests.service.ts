import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { throwDatabaseError } from '../common/database-errors';
import { fetchAllRows } from '../common/fetch-all-rows';
import { CreateRedistributionRequestDto } from './dto/create-redistribution-request.dto';

@Injectable()
export class TransferRequestsService {
  async stockAvailability(db: SupabaseClient, centerId: string) {
    const { data, error } = await db.rpc('list_redistribution_stock', { p_center_id: centerId });
    if (error) throwDatabaseError(error);
    return data;
  }

  async list(db: SupabaseClient, centerId?: string) {
    let query = db.from('redistribution_requests').select(`
      id,source_center_id,destination_center_id,requester_user_id,status,note,reviewed_by,reviewed_at,created_at,updated_at,
      source:health_centers!redistribution_requests_source_center_id_fkey(name,barangay),
      destination:health_centers!redistribution_requests_destination_center_id_fkey(name,barangay),
      items:redistribution_items(id,batch_id,quantity,batch:medicine_batches(id,lot_number,expiration_date,medicine:medicines(generic_name,strength,dosage_form,unit)))
    `).order('created_at', { ascending: false });
    if (centerId) query = query.or(`source_center_id.eq.${centerId},destination_center_id.eq.${centerId}`);
    return fetchAllRows(query);
  }

  async create(db: SupabaseClient, input: CreateRedistributionRequestDto) {
    const { data, error } = await db.rpc('create_redistribution_request', {
      p_source_center_id: input.sourceCenterId,
      p_destination_center_id: input.destinationCenterId,
      p_note: input.note?.trim() || null,
      p_items: input.items.map((item) => ({ batch_id: item.batchId, quantity: item.quantity })),
    });
    if (error) throwDatabaseError(error);
    return { id: data, status: 'pending' };
  }

  async transition(db: SupabaseClient, requestId: string, action: string) {
    const { error } = await db.rpc('transition_redistribution_request', { p_request_id: requestId, p_action: action });
    if (error) throwDatabaseError(error);
    return { id: requestId, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'fulfill' ? 'fulfilled' : 'cancelled' };
  }
}
