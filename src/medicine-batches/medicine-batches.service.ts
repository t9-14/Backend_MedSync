import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

function positiveId(value: unknown, field: string): number {
  const id = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new BadRequestException(`${field} must be a positive integer`);
  return id;
}

function dateValue(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestException('expiration_date must use YYYY-MM-DD format');
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new BadRequestException('expiration_date must be a valid calendar date');
  }
  return value;
}

function boundedString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    throw new BadRequestException(`${field} must be a non-empty string of at most ${maxLength} characters`);
  }
  return value.trim();
}

@Injectable()
export class MedicineBatchesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(medicineId?: number) {
    if (medicineId) {
      return this.db.query(
        'SELECT batch_id, medicine_id, lot_number, expiration_date, status FROM medicine_batches WHERE medicine_id = ? ORDER BY batch_id',
        [medicineId],
      );
    }
    return this.db.query(
      'SELECT batch_id, medicine_id, lot_number, expiration_date, status FROM medicine_batches ORDER BY batch_id',
    );
  }

  async findOne(id: number) {
    const rows: any = await this.db.query(
      'SELECT batch_id, medicine_id, lot_number, expiration_date, status FROM medicine_batches WHERE batch_id = ?',
      [id],
    );
    if (!rows.length) throw new NotFoundException('Medicine batch not found');
    return rows[0];
  }

  async create(body: any) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Request body must be a JSON object');
    }
    const medicineId = positiveId(body.medicine_id, 'medicine_id');
    const lotNumber = boundedString(body.lot_number, 'lot_number', 50);
    const expirationDate = dateValue(body.expiration_date);
    const status = body.status === undefined ? 'Active' : boundedString(body.status, 'status', 30);
    await this.ensureMedicineExists(medicineId);

    const result: any = await this.db.query(
      'INSERT INTO medicine_batches (medicine_id, lot_number, expiration_date, status) VALUES (?, ?, ?, ?)',
      [medicineId, lotNumber, expirationDate, status],
    );
    return this.findOne(result.insertId);
  }

  async update(id: number, body: any) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Request body must be a JSON object');
    }
    const updates: string[] = [];
    const params: any[] = [];

    if (body.medicine_id !== undefined) {
      const medicineId = positiveId(body.medicine_id, 'medicine_id');
      await this.ensureMedicineExists(medicineId);
      updates.push('medicine_id = ?');
      params.push(medicineId);
    }
    if (body.lot_number !== undefined) {
      updates.push('lot_number = ?');
      params.push(boundedString(body.lot_number, 'lot_number', 50));
    }
    if (body.expiration_date !== undefined) {
      updates.push('expiration_date = ?');
      params.push(dateValue(body.expiration_date));
    }
    if (body.status !== undefined) {
      updates.push('status = ?');
      params.push(boundedString(body.status, 'status', 30));
    }
    if (!updates.length) throw new BadRequestException('Provide at least one batch field to update');

    await this.findOne(id);
    try {
      await this.db.query(`UPDATE medicine_batches SET ${updates.join(', ')} WHERE batch_id = ?`, [...params, id]);
    } catch (error: any) {
      this.throwDatabaseError(error);
    }
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      await this.db.query('DELETE FROM medicine_batches WHERE batch_id = ?', [id]);
    } catch (error: any) {
      this.throwDatabaseError(error);
    }
    return { ok: true };
  }

  private async ensureMedicineExists(medicineId: number) {
    const rows: any = await this.db.query('SELECT medicine_id FROM medicines WHERE medicine_id = ?', [medicineId]);
    if (!rows.length) throw new NotFoundException('Medicine not found');
  }

  private throwDatabaseError(error: any): never {
    if (error?.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new ConflictException('This batch is referenced by stock, transfer, or disposal records');
    }
    throw error;
  }
}
