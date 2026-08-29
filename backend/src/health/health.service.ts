import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';

type CheckStatus = 'ok' | 'error' | 'not_configured';

interface DependencyCheck {
  name: string;
  status: CheckStatus;
  required: boolean;
  reason?: string;
  durationMs?: number;
}

export interface HealthReport {
  status: 'ok' | 'degraded' | 'error';
  uptimeSeconds: number;
  checks: DependencyCheck[];
}

// A dependency probe must never be able to hang the health endpoint.
const CHECK_TIMEOUT_MS = 3000;

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

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

  private hasEnv(keys: string[]): boolean {
    for (const key of keys) {
      const fromProcess = this.cleanValue(process.env[key]);
      if (fromProcess) return true;

      const fromConfig = this.cleanValue(this.configService.get<string>(key));
      if (fromConfig) return true;
    }
    return false;
  }

  private async withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeout = new Promise<T>((resolve) => {
      timer = setTimeout(() => resolve(fallback), CHECK_TIMEOUT_MS);
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timer!);
    }
  }

  /**
   * Verifies dependencies that the API genuinely needs to serve requests.
   * Every probe is timeout-bounded and every failure is caught, so this
   * endpoint reports problems rather than becoming one.
   */
  async check(): Promise<HealthReport> {
    const checks: DependencyCheck[] = [];

    // --- Required: Supabase configuration present ---
    const hasSupabaseConfig = this.supabaseService.isConfigured();

    checks.push({
      name: 'supabase_config',
      status: hasSupabaseConfig ? 'ok' : 'error',
      required: true,
      reason: hasSupabaseConfig ? undefined : 'SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY missing',
    });

    // --- Required: Supabase reachable (actual query) ---
    if (hasSupabaseConfig) {
      const startedAt = process.hrtime.bigint();
      const result = await this.withTimeout(
        this.supabaseService.verifyConnection().catch((err) => ({
          service: 'supabase',
          status: 'error' as const,
          reason: err?.message || 'unknown error',
        })),
        { service: 'supabase', status: 'error' as const, reason: `timed out after ${CHECK_TIMEOUT_MS}ms` },
      );
      const durationMs = Number((process.hrtime.bigint() - startedAt) / 1000000n);

      checks.push({
        name: 'supabase_connectivity',
        status: result.status,
        required: true,
        reason: 'reason' in result ? result.reason : undefined,
        durationMs,
      });
    }

    // --- Supabase Service Role Key ---
    checks.push({
      name: 'supabase_service_role_key',
      status: this.supabaseService.hasAdminClient() ? 'ok' : 'not_configured',
      required: false,
    });

    // --- Optional: things whose absence degrades but does not break the API ---
    const optional: Array<[string, string[]]> = [
      ['weather_api_key', ['WEATHER_API_KEY', 'OPENWEATHER_API_KEY']],
      ['stripe_secret_key', ['STRIPE_SECRET_KEY']],
      ['stripe_webhook_secret', ['STRIPE_WEBHOOK_SECRET']],
      ['paddle_api_key', ['PADDLE_API_KEY']],
      ['paddle_webhook_secret', ['PADDLE_WEBHOOK_SECRET']],
    ];

    for (const [name, keys] of optional) {
      checks.push({
        name,
        status: this.hasEnv(keys) ? 'ok' : 'not_configured',
        required: false,
      });
    }

    const requiredFailed = checks.some((c) => c.required && c.status !== 'ok');
    const optionalMissing = checks.some((c) => !c.required && c.status !== 'ok');

    const status: HealthReport['status'] = requiredFailed
      ? 'error'
      : optionalMissing
        ? 'degraded'
        : 'ok';

    if (requiredFailed) {
      this.logger.warn(
        `Health check failing: ${checks
          .filter((c) => c.required && c.status !== 'ok')
          .map((c) => `${c.name} (${c.reason})`)
          .join('; ')}`,
      );
    }

    return {
      status,
      uptimeSeconds: Math.round(process.uptime()),
      checks,
    };
  }
}
