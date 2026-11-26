import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class DatabaseService {
  private readonly url: string;
  private readonly anonKey: string;

  constructor() {
    this.url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    this.anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

    if (!this.url || !this.anonKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be configured');
    }
    if (!this.url.startsWith('https://') && !this.url.startsWith('http://localhost')) {
      throw new Error('SUPABASE_URL must use HTTPS outside local development');
    }
  }

  forUser(accessToken: string): SupabaseClient {
    return createClient(this.url, this.anonKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  }
}
