import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { throwDatabaseError } from '../common/database-errors';
import { fetchAllRows } from '../common/fetch-all-rows';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';

@Injectable()
export class InventoryStocksService {
  async list(db: SupabaseClient, centerId?: string) {
    let query = db.from('inventory_stocks')
      .select('id,center_id,batch_id,quantity,updated_at,center:health_centers(name,barangay),batch:medicine_batches(id,lot_number,expiration_date,status,medicine:medicines(id,generic_name,strength,dosage_form,unit))')
      .order('updated_at', { ascending: false });
    if (centerId) query = query.eq('center_id', centerId);
    return fetchAllRows(query);
  }

  async transactions(db: SupabaseClient, centerId?: string) {
    let query = db.from('stock_transactions')
      .select('id,center_id,batch_id,transaction_type,quantity,note,redistribution_request_id,created_by,created_at,batch:medicine_batches(lot_number,expiration_date,medicine:medicines(generic_name,strength,dosage_form,unit))')
      .order('created_at', { ascending: false });
    if (centerId) query = query.eq('center_id', centerId);
    return fetchAllRows(query);
  }

  async createTransaction(db: SupabaseClient, input: CreateStockTransactionDto) {
    const { data, error } = await db.rpc('record_stock_transaction', {
      p_center_id: input.centerId, p_batch_id: input.batchId, p_transaction_type: input.transactionType,
      p_quantity: input.quantity, p_note: input.note?.trim() || null,
    });
    if (error) throwDatabaseError(error);
    return { id: data };
  }
}
