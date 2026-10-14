import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

const statuses = new Set(['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled']);

function positiveId(value: unknown, field: string): number {
  const id = typeof value === 'number' ? value : Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new BadRequestException(`${field} must be a positive integer`);
  return id;
}

function requestDate(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestException('request_date must use YYYY-MM-DD format');
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new BadRequestException('request_date must be a valid calendar date');
  }
  return value;
}

@Injectable()
export class TransferRequestsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.query(
      'SELECT tr.transfer_id, tr.source_center_id, src.center_name AS source_center_name, tr.destination_center_id, dst.center_name AS destination_center_name, tr.request_date, tr.status FROM transfer_requests tr JOIN health_centers src ON src.center_id = tr.source_center_id JOIN health_centers dst ON dst.center_id = tr.destination_center_id ORDER BY tr.transfer_id',
    );
  }

  async findOne(id: number) {
    const rows: any = await this.db.query(
      'SELECT tr.transfer_id, tr.source_center_id, src.center_name AS source_center_name, tr.destination_center_id, dst.center_name AS destination_center_name, tr.request_date, tr.status FROM transfer_requests tr JOIN health_centers src ON src.center_id = tr.source_center_id JOIN health_centers dst ON dst.center_id = tr.destination_center_id WHERE tr.transfer_id = ?',
      [id],
    );
    if (!rows.length) throw new NotFoundException('Transfer request not found');
    return rows[0];
  }

  async create(body: any) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Request body must be a JSON object');
    }
    const sourceId = positiveId(body.source_center_id, 'source_center_id');
    const destinationId = positiveId(body.destination_center_id, 'destination_center_id');
    if (sourceId === destinationId) throw new BadRequestException('Source and destination centers must be different');
    const date = requestDate(body.request_date);
    if (body.status !== undefined) throw new BadRequestException('New transfer requests always start as Pending');
    await this.ensureCenterExists(sourceId);
    await this.ensureCenterExists(destinationId);
    const result: any = await this.db.query(
      'INSERT INTO transfer_requests (source_center_id, destination_center_id, request_date, status) VALUES (?, ?, ?, ?)',
      [sourceId, destinationId, date, 'Pending'],
    );
    return this.findOne(result.insertId);
  }

  async update(id: number, body: any) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Request body must be a JSON object');
    }
    const current = await this.findOne(id);
    if (current.status !== 'Pending') throw new ConflictException('Only pending transfer requests can be edited');

    const sourceId = body.source_center_id === undefined ? current.source_center_id : positiveId(body.source_center_id, 'source_center_id');
    const destinationId = body.destination_center_id === undefined ? current.destination_center_id : positiveId(body.destination_center_id, 'destination_center_id');
    if (sourceId === destinationId) throw new BadRequestException('Source and destination centers must be different');
    const date = body.request_date === undefined ? current.request_date : requestDate(body.request_date);
    const status = body.status === undefined ? current.status : this.validateStatus(body.status);
    if (sourceId !== current.source_center_id || destinationId !== current.destination_center_id) {
      const items: any = await this.db.query('SELECT item_id FROM transfer_items WHERE transfer_id = ? LIMIT 1', [id]);
      if (items.length) throw new ConflictException('Remove transfer items before changing the source or destination');
    }
    await this.ensureCenterExists(sourceId);
    await this.ensureCenterExists(destinationId);
    await this.db.query(
      'UPDATE transfer_requests SET source_center_id = ?, destination_center_id = ?, request_date = ?, status = ? WHERE transfer_id = ?',
      [sourceId, destinationId, date, status, id],
    );
    return this.findOne(id);
  }

  async remove(id: number) {
    const request = await this.findOne(id);
    if (request.status !== 'Pending' && request.status !== 'Cancelled') {
      throw new ConflictException('Only pending or cancelled transfer requests can be deleted');
    }
    await this.db.query('DELETE FROM transfer_requests WHERE transfer_id = ?', [id]);
    return { ok: true };
  }

  private validateStatus(value: unknown): string {
    if (typeof value !== 'string' || !statuses.has(value)) {
      throw new BadRequestException('status must be Pending, Approved, Rejected, Completed, or Cancelled');
    }
    return value;
  }

  private async ensureCenterExists(centerId: number) {
    const rows: any = await this.db.query('SELECT center_id FROM health_centers WHERE center_id = ?', [centerId]);
    if (!rows.length) throw new NotFoundException('Health center not found');
  }
}
