import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class HealthCentersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.query('SELECT * FROM health_centers'); //[cite: 2]
  }

  async create(center: any) {
    const { center_name, barangay, contact_number } = center;
    const sql = `INSERT INTO health_centers (center_name, barangay, contact_number) VALUES (?, ?, ?)`; //[cite: 2]
    return this.db.query(sql, [center_name, barangay, contact_number]);
  }

  async update(id: number, center: any) {
    const { center_name, contact_number } = center;
    const sql = `UPDATE health_centers SET center_name = ?, contact_number = ? WHERE center_id = ?`; //[cite: 2]
    return this.db.query(sql, [center_name, contact_number, id]);
  }

  async remove(id: number) {
    return this.db.query('DELETE FROM health_centers WHERE center_id = ?', [id]); //[cite: 2]
  }
}