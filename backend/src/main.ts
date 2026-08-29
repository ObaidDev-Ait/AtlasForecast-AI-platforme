import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

// Essential origins that must always be allowed in all environments
const DEFAULT_ALLOWED_ORIGINS = [
  'https://atlas-forecast-ai-platforme-api-gules.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function resolveCorsOrigins(configService: ConfigService): string[] {
  const envSources = [
    process.env.CORS_ORIGINS,
    configService.get<string>('CORS_ORIGINS'),
    process.env.FRONTEND_URL,
    configService.get<string>('FRONTEND_URL'),
  ];

  const configured = envSources
    .filter((val): val is string => typeof val === 'string' && val.trim().length > 0)
    .flatMap((val) => val.split(','))
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured]));
}

async function bootstrap() {
  // rawBody is required for Stripe webhook signature verification. Without it
  // req.rawBody is undefined and no signature can ever be validated.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const configService = app.get(ConfigService);

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

  console.log('[CORS Configuration]');
  console.log(`- Allowed Origins (${allowedOrigins.length}): ${allowedOrigins.join(', ')}`);
  console.log('- Dynamic Wildcards: *.vercel.app, localhost:*');
  console.log('- Allowed Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  console.log('- Allowed Headers: Authorization, Content-Type, Accept, Origin, X-Requested-With, apikey, x-client-info');
  console.log('- Credentials: true');

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no Origin header (curl, mobile apps, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const normalized = origin.trim().replace(/\/+$/, '');

      // 1. Direct or case-insensitive match against allowedOrigins
      const isExplicitlyAllowed = allowedOrigins.some(
        (allowed) => allowed.toLowerCase() === normalized.toLowerCase(),
      );
      if (isExplicitlyAllowed) {
        return callback(null, true);
      }

      // 2. Allow any valid Vercel deployment (*.vercel.app)
      const isVercel = /^https:\/\/[a-zA-Z0-9-.]+\.vercel\.app$/i.test(normalized);
      if (isVercel) {
        return callback(null, true);
      }

      // 3. Allow local dev on any port (localhost / 127.0.0.1)
      const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized);
      if (isLocal) {
        return callback(null, true);
      }

      // 4. Wildcard matching for any configured origins containing *
      const isWildcardMatch = allowedOrigins.some((allowed) => {
        if (!allowed.includes('*')) return false;
        const pattern = '^' + allowed.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
        return new RegExp(pattern, 'i').test(normalized);
      });
      if (isWildcardMatch) {
        return callback(null, true);
      }

      console.warn(`[CORS Blocked] Origin: ${origin}`);
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Client-Info',
      'apikey',
      'baggage',
      'sentry-trace',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
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
}
bootstrap();
