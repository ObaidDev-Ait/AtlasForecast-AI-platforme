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
    throw new Error(
      'CORS_ORIGINS must be set in production. Refusing to start with an empty allowlist.',
    );
  }

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Requests with no Origin header (curl, server-to-server, Stripe
      // webhooks) are not browser cross-origin requests, so CORS does not
      // apply to them.
      if (!origin) {
        return callback(null, true);
      }
      return callback(null, allowedOrigins.includes(origin));
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

  const port = configService.get<number>('PORT') || 4001;

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`CORS allowlist: ${allowedOrigins.join(', ') || '(none)'}`);
}
bootstrap();
