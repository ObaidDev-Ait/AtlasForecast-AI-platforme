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

  private cleanValue(val: any): string | undefined {
    if (typeof val !== 'string') return undefined;
    let trimmed = val.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      trimmed = trimmed.slice(1, -1).trim();
    }
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private resolveEnv(keys: string[]): string | undefined {
    for (const key of keys) {
      const fromProcess = this.cleanValue(process.env[key]);
      if (fromProcess) return fromProcess;

      const fromConfig = this.cleanValue(this.configService.get<string>(key));
      if (fromConfig) return fromConfig;
    }
    return undefined;
  }

  getSupabaseUrl(): string | undefined {
    return this.resolveEnv(['SUPABASE_URL', 'VITE_SUPABASE_URL']);
  }

  getSupabasePublishableKey(): string | undefined {
    return this.resolveEnv([
      'SUPABASE_PUBLISHABLE_KEY',
      'SUPABASE_ANON_KEY',
      'SUPABASE_KEY',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_SUPABASE_PUBLISHABLE_KEY',
    ]);
  }

  getSupabaseServiceRoleKey(): string | undefined {
    return this.resolveEnv([
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_SERVICE_KEY',
      'SERVICE_ROLE_KEY',
    ]);
  }

  isConfigured(): boolean {
    return Boolean(this.getSupabaseUrl() && this.getSupabasePublishableKey());
  }

  onModuleInit() {
    const supabaseUrl = this.getSupabaseUrl();
    const supabaseKey = this.getSupabasePublishableKey();

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Supabase URL or Key is missing.');
      return;
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const serviceRoleKey = this.getSupabaseServiceRoleKey();
    if (serviceRoleKey && !serviceRoleKey.startsWith('<')) {
      this.supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey, {
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
