import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PaddleService } from './paddle/paddle.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [BillingController],
  providers: [BillingService, PaddleService],
  exports: [BillingService, PaddleService],
})
export class BillingModule {}
