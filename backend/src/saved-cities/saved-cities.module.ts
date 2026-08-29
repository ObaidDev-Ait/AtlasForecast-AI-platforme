import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { SavedCitiesController } from './saved-cities.controller';
import { SavedCitiesService } from './saved-cities.service';

@Module({
  imports: [SupabaseModule],
  controllers: [SavedCitiesController],
  providers: [SavedCitiesService],
})
export class SavedCitiesModule {}
