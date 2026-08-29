import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'A valid email address is required' })
  @MaxLength(320)
  email: string;

  // Deliberately no MinLength here: rejecting a short password at login would
  // leak information about password policy for existing accounts. Only the
  // length bound needed to stop oversized payloads is applied.
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  @MaxLength(128)
  password: string;
}
