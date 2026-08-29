import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';

/**
 * MigrationService
 *
 * Runs database migrations on application startup using the Supabase
 * admin client (service-role key). This avoids needing a direct psql
 * connection or the database password.
 *
 * Migrations are idempotent — safe to run on every startup.
 */
@Injectable()
export class MigrationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.runMigrations();
  }

  private async runMigrations() {
    this.logger.log('Checking pending migrations...');
    await this.migration001AddRoleToProfiles();
    this.logger.log('Migration check complete.');
  }

  /**
   * Migration 001: Add role TEXT column to profiles table.
   * Default: 'user'. Allowed values: 'user', 'admin'.
   */
  private async migration001AddRoleToProfiles() {
    const adminClient = this.supabaseService.getAdminClient();
    if (!adminClient) {
      this.logger.warn('Migration 001: skipped (SUPABASE_SERVICE_ROLE_KEY not configured)');
      return;
    }

    try {
      // Probe: attempt to read the role column
      const { error: probeError } = await adminClient
        .from('profiles')
        .select('role')
        .limit(1);

      if (!probeError) {
        this.logger.log('Migration 001: role column exists ✓');
        return;
      }

      const msg = probeError.message?.toLowerCase() ?? '';
      if (!msg.includes('role') && !msg.includes('column')) {
        this.logger.warn(`Migration 001: unexpected probe error: ${probeError.message}`);
        return;
      }

      // Column is missing — try via exec_sql RPC (requires the function to exist)
      this.logger.warn('Migration 001: role column missing — attempting to apply...');

      const { error: rpcError } = await adminClient.rpc('exec_sql' as any, {
        sql: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'`,
      });

      if (!rpcError) {
        // Also run the UPDATE via RPC
        await adminClient.rpc('exec_sql' as any, {
          sql: `UPDATE public.profiles SET role = 'user' WHERE role IS NULL OR role = ''`,
        });
        this.logger.log('Migration 001: applied via exec_sql RPC ✓');
        return;
      }

      // exec_sql RPC unavailable — log SQL for manual application
      this.logger.error(
        '\n╔══════════════════════════════════════════════════════════════╗\n' +
        '║  MANUAL MIGRATION REQUIRED                                   ║\n' +
        '╠══════════════════════════════════════════════════════════════╣\n' +
        '║  Please run the following SQL in your Supabase SQL Editor:   ║\n' +
        '║  Dashboard → SQL Editor → New query → Paste → Run           ║\n' +
        '╚══════════════════════════════════════════════════════════════╝\n\n' +
        "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';\n" +
        "UPDATE public.profiles SET role = 'user' WHERE role IS NULL OR role = '';\n",
      );
    } catch (e: any) {
      this.logger.error(`Migration 001 exception: ${e?.message}`);
    }
  }
}

