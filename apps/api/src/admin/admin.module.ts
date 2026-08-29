import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [SupabaseModule, ProfileModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
