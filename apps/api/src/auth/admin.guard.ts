import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  private readonly logger = new Logger(AdminAuthGuard.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly profileService: ProfileService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization token provided');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }

    const supabase = this.supabaseService.getClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      this.logger.warn(`Admin token validation failed: ${error?.message || 'no user returned'}`);
      throw new UnauthorizedException(error?.message || 'Invalid or expired token');
    }

    // Resolve user's actual role server-side
    let profileRole: string | undefined;
    try {
      const adminClient = this.supabaseService.getAdminClient() ?? supabase;
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      profileRole = profile?.role;
    } catch (_) {}

    const resolvedRole = this.profileService.getUserRole(user, profileRole);

    if (resolvedRole !== 'admin') {
      this.logger.warn(`Unauthorized admin access attempt by user ${user.id} (${user.email})`);
      throw new ForbiddenException('Accès refusé. Droits administrateur requis.');
    }

    request.user = {
      ...user,
      role: 'admin',
    };

    return true;
  }
}
