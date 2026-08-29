import { Injectable, HttpException, HttpStatus, Logger, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async register(body: RegisterDto) {
    const { email, password, first_name, last_name } = body;

    const adminClient = this.supabaseService.getAdminClient();
    if (adminClient) {
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: first_name || '',
          last_name: last_name || '',
        },
      });

      if (error) {
        const msg = error.message?.toLowerCase() || '';
        if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already exists')) {
          throw new HttpException('Cet email est déjà enregistré. Veuillez vous connecter.', HttpStatus.CONFLICT);
        }
        throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
      }

      if (data?.user) {
        const fullName = [first_name, last_name].filter(Boolean).join(' ');
        const { error: upsertErr } = await adminClient.from('profiles').upsert(
          {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            role: 'user',
            is_premium: false,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'id' },
        );

        if (upsertErr && upsertErr.message?.includes('role')) {
          await adminClient.from('profiles').upsert(
            {
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              is_premium: false,
              created_at: new Date().toISOString(),
            },
            { onConflict: 'id' },
          );
        }
      }

      // Auto-sign in to return an authenticated session immediately
      const supabase = this.supabaseService.getClient();
      const signInRes = await supabase.auth.signInWithPassword({ email, password });
      return signInRes.data?.session ? signInRes.data : { user: data.user };
    }

    // Fallback when admin client is not configured
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
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already exists')) {
        throw new HttpException('Cet email est déjà enregistré. Veuillez vous connecter.', HttpStatus.CONFLICT);
      }
      if (msg.includes('rate limit')) {
        throw new HttpException(
          "Limite d'envoi d'e-mails atteinte par le service Supabase. Configurez SUPABASE_SERVICE_ROLE_KEY dans apps/api/.env pour activer la création directe de comptes sans limitation d'email.",
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }

    return data;
  }

  async login(body: LoginDto) {
    const { email, password } = body;

    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Reason only — never the credentials or the full Supabase payload.
      this.logger.warn(`Login failed: ${error.message}`);
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }

    return data;
  }

  /**
   * Exchanges a refresh token for a new session.
   *
   * Supabase rotates the refresh token on every use, so the caller must store
   * whatever comes back. A failure here means the session is genuinely over
   * and the client should sign out.
   */
  async refresh(refreshToken: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (error || !data?.session) {
      this.logger.warn(`Session refresh failed: ${error?.message || 'no session returned'}`);
      throw new UnauthorizedException(error?.message || 'Could not refresh session');
    }

    return { session: data.session, user: data.user };
  }

  /**
   * Sends a password-reset email via Supabase Auth.
   *
   * Supabase delivers a one-time "magic link" to the user's inbox.
   * Clicking it redirects them to the configured Site URL where they
   * can set a new password.
   *
   * We intentionally never reveal whether the email exists — this
   * prevents account-enumeration attacks.
   */
  async forgotPassword(email: string) {
    if (!email || !email.includes('@')) {
      throw new HttpException('Adresse e-mail invalide.', HttpStatus.BAD_REQUEST);
    }

    // Use the admin client if available for reliable delivery;
    // otherwise fall back to the public client.
    const client = this.supabaseService.getAdminClient() || this.supabaseService.getClient();

    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`,
    });

    if (error) {
      this.logger.warn(`Password reset request failed: ${error.message}`);
      // Still return success to prevent email enumeration
    }

    return {
      message: 'Si un compte existe avec cette adresse, un lien de réinitialisation a été envoyé à votre boîte e-mail.',
    };
  }
}
