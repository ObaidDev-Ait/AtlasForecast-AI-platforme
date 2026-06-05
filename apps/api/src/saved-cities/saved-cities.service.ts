import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SavedCitiesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getCities(user: any) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('saved_cities')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    return data;
  }

  async addCity(user: any, body: any) {
    const supabase = this.supabaseService.getClient();
    const cityName = body.city_name || body.cityName;

    if (!cityName) {
      throw new HttpException('City name is required', HttpStatus.BAD_REQUEST);
    }

    const { data, error } = await supabase
      .from('saved_cities')
      .insert({
        user_id: user.id,
        city_name: cityName,
      })
      .select()
      .single();

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    return data;
  }

  async deleteCity(user: any, id: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('saved_cities')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    if (!data || data.length === 0) {
      throw new HttpException('City not found or unauthorized', HttpStatus.NOT_FOUND);
    }

    return { success: true };
  }
}
