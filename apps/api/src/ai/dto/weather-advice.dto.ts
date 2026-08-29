import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class WeatherAdviceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  question: string;
}
