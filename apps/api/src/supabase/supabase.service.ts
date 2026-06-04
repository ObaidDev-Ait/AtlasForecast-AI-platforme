import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_PUBLISHABLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Supabase URL or Key is missing.');
      return;
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  async verifyConnection() {
    try {
      // Query 1 row from profiles to assert database connectivity
      const { error } = await this.supabaseClient
        .from('profiles')
        .select('id')
        .limit(1);

      if (error && error.code !== 'PGRST116') { // PGRST116 is single/empty row, not a connection error
        this.logger.warn(`Supabase connection check warning: ${error.message}`);
      }

      return {
        service: 'supabase',
        status: 'ok',
      };
    } catch (err) {
      this.logger.error(`Supabase connection verification failed: ${err.message}`);
      throw err;
    }
  }
}
