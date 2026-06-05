import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProfileService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getProfile(user: any) {
    const supabase = this.supabaseService.getClient();
    
    // Fetch profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      // If table profiles does not have the profile row yet, create it as a fallback
      const fullName = [user.user_metadata?.first_name, user.user_metadata?.last_name]
        .filter(Boolean)
        .join(' ') || '';

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: user.created_at || new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        throw new HttpException(
          `Failed to retrieve or initialize profile: ${insertError.message}`,
          HttpStatus.BAD_REQUEST
        );
      }
      return newProfile;
    }

    return data;
  }

  async updateProfile(user: any, body: any) {
    const supabase = this.supabaseService.getClient();
    const { full_name, avatar_url } = body;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        avatar_url,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    return data;
  }
}
