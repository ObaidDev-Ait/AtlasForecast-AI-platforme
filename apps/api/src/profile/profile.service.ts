import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);
  private readonly adminStorePath = path.join(__dirname, '..', '..', 'admin-store.json');

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Evaluates the definitive role for a user ('admin' or 'user').
   * Checked in order:
   * 1. profiles.role from database (if present and valid)
   * 2. user.app_metadata.role from Supabase Auth
   * 3. Server-side admin-store.json (persisted admin registry)
   * 4. ADMIN_EMAILS environment configuration
   * 5. Defaults strictly to 'user'.
   */
  getUserRole(user: any, profileRole?: string): 'user' | 'admin' {
    if (profileRole === 'admin') {
      return 'admin';
    }

    if (user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin') {
      return 'admin';
    }

    const email = (user?.email || '').toLowerCase().trim();
    const userId = user?.id;

    // Check server-side admin-store.json
    try {
      if (fs.existsSync(this.adminStorePath)) {
        const store = JSON.parse(fs.readFileSync(this.adminStorePath, 'utf8'));
        if (Array.isArray(store.admins)) {
          if (store.admins.includes(userId) || (email && store.admins.includes(email))) {
            return 'admin';
          }
        }
      }
    } catch (e) {
      this.logger.warn(`Could not read admin-store: ${e.message}`);
    }

    // Check ADMIN_EMAILS environment variable
    const adminEmailsConfig = this.configService.get<string>('ADMIN_EMAILS');
    if (adminEmailsConfig && email) {
      const allowedEmails = adminEmailsConfig.split(',').map((e) => e.trim().toLowerCase());
      if (allowedEmails.includes(email)) {
        return 'admin';
      }
    }

    return 'user';
  }

  async getProfile(user: any) {
    const supabase = this.supabaseService.getClient();

    // Read the existing profile. maybeSingle() reports "no row" as data: null
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      throw new HttpException(
        `Failed to read profile: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (data) {
      const role = this.getUserRole(user, data.role);
      return {
        ...data,
        role,
      };
    }

    // No profile row yet — create it.
    const fullName = [user.user_metadata?.first_name, user.user_metadata?.last_name]
      .filter(Boolean)
      .join(' ') || '';

    const role = this.getUserRole(user);

    const { data: newProfile, error: upsertError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email,
          full_name: fullName,
          avatar_url: user.user_metadata?.avatar_url || null,
          role: 'user', // strictly default to 'user'
          is_premium: false,
          created_at: user.created_at || new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
      .select()
      .maybeSingle();

    if (upsertError) {
      // If role column doesn't exist yet in Supabase table, retry without role field
      if (upsertError.message?.includes('role')) {
        const { data: fallbackProfile, error: fallbackError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: user.id,
              email: user.email,
              full_name: fullName,
              avatar_url: user.user_metadata?.avatar_url || null,
              created_at: user.created_at || new Date().toISOString(),
            },
            { onConflict: 'id' },
          )
          .select()
          .maybeSingle();

        if (fallbackError) {
          throw new HttpException(`Failed to initialize profile: ${fallbackError.message}`, HttpStatus.BAD_REQUEST);
        }
        return { ...fallbackProfile, role };
      }

      throw new HttpException(
        `Failed to initialize profile: ${upsertError.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!newProfile) {
      throw new HttpException(
        'Profile was written but could not be read back.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      ...newProfile,
      role,
    };
  }

  async updateProfile(user: any, body: UpdateProfileDto) {
    const supabase = this.supabaseService.getClient();

    // Explicit allowlist: only full_name and avatar_url can be updated
    const patch: Pick<UpdateProfileDto, 'full_name' | 'avatar_url'> = {};
    if (body.full_name !== undefined) patch.full_name = body.full_name;
    if (body.avatar_url !== undefined) patch.avatar_url = body.avatar_url;

    if (Object.keys(patch).length === 0) {
      throw new HttpException('No updatable fields provided', HttpStatus.BAD_REQUEST);
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    const role = this.getUserRole(user, data.role);
    return {
      ...data,
      role,
    };
  }
}
