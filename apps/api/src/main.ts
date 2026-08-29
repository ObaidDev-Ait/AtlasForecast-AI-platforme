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
