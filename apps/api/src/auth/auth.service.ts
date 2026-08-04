import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(body: any) {
    const { email, password, first_name, last_name } = body;

    if (!email || !password) {
      throw new HttpException('Email and password are required', HttpStatus.BAD_REQUEST);
    }

    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: first_name || '',
          last_name: last_name || '',
        },
      },
    });

    if (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }

    return data;
  }

  async login(body: any) {
    console.log("Backend Login DTO Received:", body);
    const { email, password } = body;

    if (!email || !password) {
      throw new HttpException('Email and password are required', HttpStatus.BAD_REQUEST);
    }

    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase Login API Error:", JSON.stringify(error, null, 2));
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }

    console.log("Supabase Login Success. User ID:", data.user?.id);
    return data;
  }
}
