import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '../auth/auth.guard';
import { PremiumGuard } from '../auth/premium.guard';
import { WeatherAdviceDto } from './dto/weather-advice.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(AuthGuard, PremiumGuard)
  @Post('weather-advice')
  async getWeatherAdvice(@Req() req: any, @Body() body: WeatherAdviceDto) {
    const userId = req.user?.id;
    return this.aiService.getWeatherAdvice(body, userId);
  }
}
