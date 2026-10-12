import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
  createUser(username: string, password: string) {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.query('SELECT * FROM users'); //
  }

  async create(user: any) {
    const { username, password, role, center_id } = user;
    const sql = `INSERT INTO users (username, password, role, center_id) VALUES (?, ?, ?, ?)`; //[cite: 2]
    return this.db.query(sql, [username, password, role, center_id]);
  }

  async update(id: number, user: any) {
    const { username, role } = user;
    const sql = `UPDATE users SET username = ?, role = ? WHERE user_id = ?`; //[cite: 2]
    return this.db.query(sql, [username, role, id]);
  }

  async remove(id: number) {
    return this.db.query('DELETE FROM users WHERE user_id = ?', [id]); //[cite: 2]
  }
}