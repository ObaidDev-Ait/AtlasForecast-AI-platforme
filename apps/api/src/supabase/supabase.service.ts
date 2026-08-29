import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient;

  // Elevated client, only created when SUPABASE_SERVICE_ROLE_KEY is provided.
  // Used exclusively for entitlement writes that must bypass RLS.
  private supabaseAdminClient: SupabaseClient | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_PUBLISHABLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Supabase URL or Key is missing.');
      return;
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    if (serviceRoleKey && serviceRoleKey.trim().length > 0 && !serviceRoleKey.startsWith('<')) {
      this.supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey.trim(), {
        auth: { persistSession: false },
      });
      this.logger.log('Service-role client initialized; entitlement writes are privileged.');
    } else {
      this.logger.warn(
        'SUPABASE_SERVICE_ROLE_KEY is not set. Entitlement writes will use the publishable key, ' +
          'which is the same privilege level as the browser. See README/security notes.',
      );
    }
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  /**
   * Returns the service-role client when configured, otherwise null.
   * Callers must decide explicitly what to do when it is unavailable rather
   * than silently falling back to a browser-equivalent privilege level.
   */
  getAdminClient(): SupabaseClient | null {
    return this.supabaseAdminClient;
  }

  hasAdminClient(): boolean {
    return this.supabaseAdminClient !== null;
  }

  /**
   * Real connectivity check. Returns status 'ok' only when a query actually
   * succeeded; anything else is reported as 'error' with the reason.
   * Never throws — callers decide how to surface a failure.
   */
  async verifyConnection(): Promise<{ service: string; status: 'ok' | 'error'; reason?: string }> {
    if (!this.supabaseClient) {
      return { service: 'supabase', status: 'error', reason: 'client not initialized' };
    }

    try {
      const { error } = await this.supabaseClient.from('profiles').select('id').limit(1);

      if (error) {
        this.logger.warn(`Supabase connection check failed: ${error.message}`);
        return { service: 'supabase', status: 'error', reason: error.message };
      }

      return { service: 'supabase', status: 'ok' };
    } catch (err) {
      this.logger.error(`Supabase connection verification failed: ${err.message}`);
      return { service: 'supabase', status: 'error', reason: err.message };
    }
  }
}
