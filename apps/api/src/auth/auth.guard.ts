import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

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
    console.log("AUTH HEADER:", request.headers.authorization);
    console.log("TOKEN:", token);
    
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        console.log("JWT PAYLOAD:", payload);
        console.log("JWT ISS:", payload.iss);
        console.log("JWT AUD:", payload.aud);
        console.log("JWT SUB:", payload.sub);
      } else {
        console.warn("Token does not have 3 parts");
      }
    } catch (decodeErr) {
      console.error("Failed to decode JWT payload:", decodeErr.message);
    }
    
    const result = await supabase.auth.getUser(token);
    console.log("SUPABASE RESPONSE:", result);

    const { data: { user }, error } = result;

    if (error || !user) {
      console.warn("AuthGuard validation failed:", error?.message || 'No user returned');
      throw new UnauthorizedException(error?.message || 'Invalid token');
    }

    request.user = user;
    return true;
  }
}
