import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

@Injectable()
export class DatabaseService {
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'darkraio8', 
      database: 'medsync',
    });
  }

  async query(sql: string, params?: any[]) {
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }
}