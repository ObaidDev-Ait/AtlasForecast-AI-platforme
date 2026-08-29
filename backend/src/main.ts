import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

// Origins always allowed so local development keeps working without any
// extra configuration. Production origins come from CORS_ORIGINS.
const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
];

function resolveCorsOrigins(configService: ConfigService): string[] {
  const configured = (configService.get<string>('CORS_ORIGINS') || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  // In production the allowlist is exactly what was configured. In development
  // the local Vite origins are always included.
  return isProduction ? configured : [...new Set([...DEV_ORIGINS, ...configured])];
}

async function bootstrap() {
  // rawBody is required for Stripe webhook signature verification. Without it
  // req.rawBody is undefined and no signature can ever be validated.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const configService = app.get(ConfigService);
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  // Safe environment diagnostic: Reports presence (true/false) only; NEVER prints secret values.
  const hasVal = (keys: string[]) =>
    keys.some((k) => {
      const v = process.env[k] || configService.get<string>(k);
      return typeof v === 'string' && v.trim().length > 0;
    });

  console.log('[Environment Diagnostic]');
  console.log(`- SUPABASE_URL: ${hasVal(['SUPABASE_URL', 'VITE_SUPABASE_URL'])}`);
  console.log(`- SUPABASE_PUBLISHABLE_KEY: ${hasVal(['SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_ANON_KEY', 'SUPABASE_KEY', 'VITE_SUPABASE_ANON_KEY'])}`);
  console.log(`- SUPABASE_SERVICE_ROLE_KEY: ${hasVal(['SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY', 'SERVICE_ROLE_KEY'])}`);
  console.log(`- WEATHER_API_KEY: ${hasVal(['WEATHER_API_KEY', 'OPENWEATHER_API_KEY'])}`);
  console.log(`- PADDLE_API_KEY: ${hasVal(['PADDLE_API_KEY'])}`);
  console.log(`- PADDLE_WEBHOOK_SECRET: ${hasVal(['PADDLE_WEBHOOK_SECRET'])}`);
  console.log(`- PORT: ${process.env.PORT || configService.get('PORT') || 4001}`);
  console.log(`- NODE_ENV: ${process.env.NODE_ENV || configService.get('NODE_ENV') || 'development'}`);

  const allowedOrigins = resolveCorsOrigins(configService);

  if (isProduction && allowedOrigins.length === 0) {
    console.warn(
      'WARNING: CORS_ORIGINS is not set in production. Defaulting to allow Vercel domains (*.vercel.app). Configure CORS_ORIGINS in production environment variables.',
    );
    allowedOrigins.push('https://*.vercel.app');
  }

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Requests with no Origin header (curl, server-to-server, Stripe
      // webhooks) are not browser cross-origin requests, so CORS does not
      // apply to them.
      if (!origin) {
        return callback(null, true);
      }
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === origin) return true;
        if (allowed.includes('*')) {
          const pattern = '^' + allowed.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
          return new RegExp(pattern).test(origin);
        }
        return false;
      });
      return callback(null, isAllowed);
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    maxAge: 86400,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties with no matching DTO decorator
      forbidNonWhitelisted: true, // reject unexpected properties outright
      transform: true,
    }),
  );

  const rawPort = process.env.PORT || configService.get<string | number>('PORT') || 4001;
  const port = typeof rawPort === 'string' ? parseInt(rawPort, 10) : rawPort;

  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
  console.log(`CORS allowlist: ${allowedOrigins.join(', ') || '(none)'}`);
}
bootstrap();
