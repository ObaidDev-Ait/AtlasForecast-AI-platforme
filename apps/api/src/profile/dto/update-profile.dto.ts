import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

/**
 * The ONLY profile fields a user may change.
 *
 * With the global ValidationPipe configured as
 * { whitelist: true, forbidNonWhitelisted: true }, any other property — most
 * importantly is_premium or plan_name — causes the request to be rejected
 * outright rather than silently stripped.
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  full_name?: string;

  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'avatar_url must be a valid URL' })
  @MaxLength(2048)
  avatar_url?: string;
}
