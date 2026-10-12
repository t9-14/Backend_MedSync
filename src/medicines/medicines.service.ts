import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MedicinesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.query('SELECT * FROM medicines'); //[cite: 2]
  }

  async create(medicine: any) {
    const { generic_name, dosage, category } = medicine;
    const sql = `INSERT INTO medicines (generic_name, dosage, category) VALUES (?, ?, ?)`; //[cite: 2]
    return this.db.query(sql, [generic_name, dosage, category]);
  }

  async update(id: number, medicine: any) {
    const { dosage, category } = medicine;
    const sql = `UPDATE medicines SET dosage = ?, category = ? WHERE medicine_id = ?`; //[cite: 2]
    return this.db.query(sql, [dosage, category, id]);
  }

  async remove(id: number) {
    return this.db.query('DELETE FROM medicines WHERE medicine_id = ?', [id]); //[cite: 2]
  }
}