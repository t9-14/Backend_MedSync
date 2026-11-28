import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { throwDatabaseError } from '../common/database-errors';
import { fetchAllRows } from '../common/fetch-all-rows';
import { CreateMedicineBatchDto } from './dto/create-medicine-batch.dto';

@Injectable()
export class MedicineBatchesService {
  async list(db: SupabaseClient, centerId?: string, medicineId?: string) {
    let query = db.from('medicine_batches').select('id,medicine_id,lot_number,expiration_date,status,created_at,medicine:medicines(generic_name,strength,dosage_form,unit)').order('expiration_date');
    if (medicineId) query = query.eq('medicine_id', medicineId);
    if (centerId) {
      const stock = await fetchAllRows(db.from('inventory_stocks').select('batch_id').eq('center_id', centerId));
      const ids = stock?.map((row) => row.batch_id) ?? [];
      if (!ids.length) return [];
      query = query.in('id', ids);
    }
    return fetchAllRows(query);
  }

  async create(db: SupabaseClient, input: CreateMedicineBatchDto) {
    const { data, error } = await db.rpc('create_medicine_batch', {
      p_center_id: input.centerId, p_medicine_id: input.medicineId, p_lot_number: input.lotNumber.trim(),
      p_expiration_date: input.expirationDate, p_initial_quantity: input.initialQuantity ?? 0, p_note: input.note?.trim() || null,
    });
    if (error) throwDatabaseError(error);
    return { id: data };
  }
}
