import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';

export interface UserRecord {
  id: number;
  username: string;
  password: string;
  role: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async createUser(username: string, password: string) {
    const hash = await bcrypt.hash(password, 12);
    try {
      const result: any = await this.db.query(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hash, 'Staff'],
      );
      return { id: result.insertId, username, role: 'Staff' };
    } catch (error: any) {
      if (error?.code === 'ER_DUP_ENTRY') throw new ConflictException('Username already exists');
      throw error;
    }
  }

  async findByUsername(username: string): Promise<UserRecord | null> {
    const rows: any = await this.db.query(
      'SELECT user_id AS id, username, password, role FROM users WHERE username = ? LIMIT 1',
      [username],
    );
    return rows[0] ?? null;
  }

  async setRefreshToken(userId: number, token: string | null) {
    const digest = token ? createHash('sha256').update(token).digest('hex') : null;
    await this.db.query('UPDATE users SET refresh_token = ? WHERE user_id = ?', [digest, userId]);
  }

  async findByRefreshToken(token: string): Promise<Pick<UserRecord, 'id' | 'username' | 'role'> | null> {
    const digest = createHash('sha256').update(token).digest('hex');
    const rows: any = await this.db.query(
      'SELECT user_id AS id, username, role FROM users WHERE refresh_token = ? LIMIT 1',
      [digest],
    );
    return rows[0] ?? null;
  }
}
