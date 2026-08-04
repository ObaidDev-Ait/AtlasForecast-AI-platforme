import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { WeatherService } from '../weather/weather.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [SupabaseModule, BillingModule],
  controllers: [AiController],
  providers: [AiService, WeatherService],
})
export class AiModule {}
