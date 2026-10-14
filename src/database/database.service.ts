import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

@Injectable()
export class DatabaseService {
  private pool: mysql.Pool;

  constructor() {
    const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    for (const key of required) {
      if (!process.env[key]) throw new Error(`${key} must be set`);
    }
    const sslEnabled = process.env.DB_SSL === 'true';
    const sslCaPath = process.env.DB_SSL_CA_PATH;
    const sslCa = process.env.DB_SSL_CA || (sslCaPath ? readFileSync(sslCaPath, 'utf8') : undefined);
    if (sslEnabled && !sslCa) {
      throw new Error('Set DB_SSL_CA or DB_SSL_CA_PATH to the Aiven CA certificate when DB_SSL=true');
    }
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ...(sslEnabled ? {
        ssl: {
          rejectUnauthorized: true,
          ca: sslCa,
        },
      } : {}),
    });
  }

  async query(sql: string, params?: any[]) {
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }
}
