import { IsString, MaxLength, MinLength } from 'class-validator';

export class RefreshDto {
  @IsString()
  @MinLength(1, { message: 'refresh_token is required' })
  @MaxLength(2048)
  refresh_token: string;
}
