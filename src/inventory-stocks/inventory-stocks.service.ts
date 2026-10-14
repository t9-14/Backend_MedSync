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

function quantityValue(value: unknown): number {
  const quantity = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    throw new BadRequestException('quantity must be a non-negative integer');
  }
  return quantity;
}

@Injectable()
export class InventoryStocksService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(centerId?: number, batchId?: number) {
    const conditions: string[] = [];
    const params: number[] = [];
    if (centerId !== undefined) {
      conditions.push('s.center_id = ?');
      params.push(centerId);
    }
    if (batchId !== undefined) {
      conditions.push('s.batch_id = ?');
      params.push(batchId);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return this.db.query(
      `SELECT s.stock_id, s.center_id, hc.center_name, s.batch_id, mb.medicine_id, m.generic_name, mb.lot_number, mb.expiration_date, s.quantity FROM inventory_stocks s JOIN health_centers hc ON hc.center_id = s.center_id JOIN medicine_batches mb ON mb.batch_id = s.batch_id JOIN medicines m ON m.medicine_id = mb.medicine_id ${where} ORDER BY s.stock_id`,
      params,
    );
  }

  async findOne(id: number) {
    const rows: any = await this.db.query(
      'SELECT s.stock_id, s.center_id, hc.center_name, s.batch_id, mb.medicine_id, m.generic_name, mb.lot_number, mb.expiration_date, s.quantity FROM inventory_stocks s JOIN health_centers hc ON hc.center_id = s.center_id JOIN medicine_batches mb ON mb.batch_id = s.batch_id JOIN medicines m ON m.medicine_id = mb.medicine_id WHERE s.stock_id = ?',
      [id],
    );
    if (!rows.length) throw new NotFoundException('Inventory stock record not found');
    return rows[0];
  }

  async create(body: any) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Request body must be a JSON object');
    }
    const centerId = positiveId(body.center_id, 'center_id');
    const batchId = positiveId(body.batch_id, 'batch_id');
    const quantity = body.quantity === undefined ? 0 : quantityValue(body.quantity);
    await this.ensureCenterExists(centerId);
    await this.ensureBatchExists(batchId);

    const existing: any = await this.db.query(
      'SELECT stock_id FROM inventory_stocks WHERE center_id = ? AND batch_id = ? LIMIT 1',
      [centerId, batchId],
    );
    if (existing.length) {
      throw new ConflictException('A stock record for this center and batch already exists');
    }

    const result: any = await this.db.query(
      'INSERT INTO inventory_stocks (center_id, batch_id, quantity) VALUES (?, ?, ?)',
      [centerId, batchId, quantity],
    );
    return this.findOne(result.insertId);
  }

  async update(id: number, body: any) {
    if (!body || typeof body !== 'object' || Array.isArray(body) || body.quantity === undefined) {
      throw new BadRequestException('Provide quantity as a non-negative integer');
    }
    const quantity = quantityValue(body.quantity);
    await this.findOne(id);
    await this.db.query('UPDATE inventory_stocks SET quantity = ? WHERE stock_id = ?', [quantity, id]);
    return this.findOne(id);
  }

  async remove(id: number) {
    const stock: any = await this.findOne(id);
    if (stock.quantity > 0) {
      throw new ConflictException('Set quantity to zero before deleting a stock record');
    }
    await this.db.query('DELETE FROM inventory_stocks WHERE stock_id = ?', [id]);
    return { ok: true };
  }

  private async ensureCenterExists(centerId: number) {
    const rows: any = await this.db.query('SELECT center_id FROM health_centers WHERE center_id = ?', [centerId]);
    if (!rows.length) throw new NotFoundException('Health center not found');
  }

  private async ensureBatchExists(batchId: number) {
    const rows: any = await this.db.query('SELECT batch_id FROM medicine_batches WHERE batch_id = ?', [batchId]);
    if (!rows.length) throw new NotFoundException('Medicine batch not found');
  }
}
