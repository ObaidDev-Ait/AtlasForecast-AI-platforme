import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MigrationService } from './migration.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule, ConfigModule],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class MigrationModule {}

