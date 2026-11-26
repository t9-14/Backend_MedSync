import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { throwDatabaseError } from '../common/database-errors';
import { CreateMedicineDto } from './dto/create-medicine.dto';

@Injectable()
export class MedicinesService {
  async list(db: SupabaseClient, search?: string) {
    let query = db.from('medicines').select('id,generic_name,strength,dosage_form,category,unit,status,created_at').order('generic_name').limit(100);
    const term = search?.trim().replace(/[%,()]/g, '');
    if (term) query = query.ilike('generic_name', `%${term}%`);
    const { data, error } = await query;
    if (error) throwDatabaseError(error);
    return data;
  }

  async create(db: SupabaseClient, input: CreateMedicineDto) {
    const { data, error } = await db.rpc('create_medicine', {
      p_generic_name: input.genericName.trim(), p_strength: input.strength.trim(),
      p_dosage_form: input.dosageForm.trim(), p_category: input.category?.trim() || 'General', p_unit: input.unit?.trim() || 'units',
    });
    if (error) throwDatabaseError(error);
    return { id: data };
  }
}
