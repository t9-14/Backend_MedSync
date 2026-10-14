import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

function positiveId(value: unknown, field: string): number {
  const id = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new BadRequestException(`${field} must be a positive integer`);
  return id;
}

function disposalDateValue(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestException('disposal_date must use YYYY-MM-DD format');
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new BadRequestException('disposal_date must be a valid calendar date');
  }
  return value;
}

@Injectable()
export class DisposalCertificatesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.query(
      'SELECT dc.certificate_id, dc.batch_id, mb.lot_number, m.generic_name, dc.disposal_date, dc.disposal_method, dc.user_id, u.username FROM disposal_certificates dc JOIN medicine_batches mb ON mb.batch_id = dc.batch_id JOIN medicines m ON m.medicine_id = mb.medicine_id JOIN users u ON u.user_id = dc.user_id ORDER BY dc.certificate_id',
    );
  }

  async findOne(id: number) {
    const rows: any = await this.db.query(
      'SELECT dc.certificate_id, dc.batch_id, mb.lot_number, m.generic_name, dc.disposal_date, dc.disposal_method, dc.user_id, u.username FROM disposal_certificates dc JOIN medicine_batches mb ON mb.batch_id = dc.batch_id JOIN medicines m ON m.medicine_id = mb.medicine_id JOIN users u ON u.user_id = dc.user_id WHERE dc.certificate_id = ?',
      [id],
    );
    if (!rows.length) throw new NotFoundException('Disposal certificate not found');
    return rows[0];
  }

  async create(body: any, userIdValue: unknown) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Request body must be a JSON object');
    }
    const batchId = positiveId(body.batch_id, 'batch_id');
    const userId = positiveId(userIdValue, 'authenticated user id');
    const date = disposalDateValue(body.disposal_date);
    if (typeof body.disposal_method !== 'string' || !body.disposal_method.trim() || body.disposal_method.trim().length > 50) {
      throw new BadRequestException('disposal_method must be a non-empty string of at most 50 characters');
    }
    const batch: any = await this.db.query('SELECT batch_id FROM medicine_batches WHERE batch_id = ?', [batchId]);
    if (!batch.length) throw new NotFoundException('Medicine batch not found');

    try {
      const result: any = await this.db.query(
        'INSERT INTO disposal_certificates (batch_id, disposal_date, disposal_method, user_id) VALUES (?, ?, ?, ?)',
        [batchId, date, body.disposal_method.trim(), userId],
      );
      return this.findOne(result.insertId);
    } catch (error: any) {
      if (error?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('A disposal certificate already exists for this batch');
      }
      throw error;
    }
  }
}
