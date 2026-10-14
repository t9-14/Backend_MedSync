import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

function positiveId(value: unknown, field: string): number {
  const id = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new BadRequestException(`${field} must be a positive integer`);
  return id;
}

function positiveQuantity(value: unknown): number {
  const quantity = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new BadRequestException('transfer_quantity must be a positive integer');
  }
  return quantity;
}

@Injectable()
export class TransferItemsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(transferId?: number) {
    if (transferId !== undefined) {
      return this.db.query(
        'SELECT ti.item_id, ti.transfer_id, ti.batch_id, mb.medicine_id, m.generic_name, mb.lot_number, ti.transfer_quantity FROM transfer_items ti JOIN medicine_batches mb ON mb.batch_id = ti.batch_id JOIN medicines m ON m.medicine_id = mb.medicine_id WHERE ti.transfer_id = ? ORDER BY ti.item_id',
        [transferId],
      );
    }
    return this.db.query(
      'SELECT ti.item_id, ti.transfer_id, ti.batch_id, mb.medicine_id, m.generic_name, mb.lot_number, ti.transfer_quantity FROM transfer_items ti JOIN medicine_batches mb ON mb.batch_id = ti.batch_id JOIN medicines m ON m.medicine_id = mb.medicine_id ORDER BY ti.item_id',
    );
  }

  async findOne(id: number) {
    const rows: any = await this.db.query(
      'SELECT ti.item_id, ti.transfer_id, ti.batch_id, mb.medicine_id, m.generic_name, mb.lot_number, ti.transfer_quantity FROM transfer_items ti JOIN medicine_batches mb ON mb.batch_id = ti.batch_id JOIN medicines m ON m.medicine_id = mb.medicine_id WHERE ti.item_id = ?',
      [id],
    );
    if (!rows.length) throw new NotFoundException('Transfer item not found');
    return rows[0];
  }

  async create(body: any) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Request body must be a JSON object');
    }
    const transferId = positiveId(body.transfer_id, 'transfer_id');
    const batchId = positiveId(body.batch_id, 'batch_id');
    const quantity = positiveQuantity(body.transfer_quantity);
    await this.ensureRequestIsPending(transferId);
    await this.ensureBatchExists(batchId);
    const result: any = await this.db.query(
      'INSERT INTO transfer_items (transfer_id, batch_id, transfer_quantity) VALUES (?, ?, ?)',
      [transferId, batchId, quantity],
    );
    return this.findOne(result.insertId);
  }

  async update(id: number, body: any) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Request body must be a JSON object');
    }
    const current = await this.findOne(id);
    await this.ensureRequestIsPending(current.transfer_id);
    const batchId = body.batch_id === undefined ? current.batch_id : positiveId(body.batch_id, 'batch_id');
    const quantity = body.transfer_quantity === undefined
      ? current.transfer_quantity
      : positiveQuantity(body.transfer_quantity);
    if (body.batch_id !== undefined) await this.ensureBatchExists(batchId);
    await this.db.query(
      'UPDATE transfer_items SET batch_id = ?, transfer_quantity = ? WHERE item_id = ?',
      [batchId, quantity, id],
    );
    return this.findOne(id);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.ensureRequestIsPending(item.transfer_id);
    await this.db.query('DELETE FROM transfer_items WHERE item_id = ?', [id]);
    return { ok: true };
  }

  private async ensureRequestIsPending(transferId: number) {
    const rows: any = await this.db.query('SELECT status FROM transfer_requests WHERE transfer_id = ?', [transferId]);
    if (!rows.length) throw new NotFoundException('Transfer request not found');
    if (rows[0].status !== 'Pending') throw new ConflictException('Items can only be changed while the request is pending');
  }

  private async ensureBatchExists(batchId: number) {
    const rows: any = await this.db.query('SELECT batch_id FROM medicine_batches WHERE batch_id = ?', [batchId]);
    if (!rows.length) throw new NotFoundException('Medicine batch not found');
  }
}
