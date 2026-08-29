import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { SupabaseModule } from './supabase/supabase.module';
import { WeatherModule } from './weather/weather.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { SavedCitiesModule } from './saved-cities/saved-cities.module';
import { AiModule } from './ai/ai.module';
import { BillingModule } from './billing/billing.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { MigrationModule } from './migration/migration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'backend/.env', '../.env'],
    }),
    HealthModule,
    SupabaseModule,
    WeatherModule,
    AuthModule,
    ProfileModule,
    SavedCitiesModule,
    AiModule,
    BillingModule,
    NotificationsModule,
    AdminModule,
    MigrationModule,
  ],
})
export class AppModule {}




