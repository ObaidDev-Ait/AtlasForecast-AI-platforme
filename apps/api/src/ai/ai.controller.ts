import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '../auth/auth.guard';
import { PremiumGuard } from '../auth/premium.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(AuthGuard, PremiumGuard)
  @Post('weather-advice')
  async getWeatherAdvice(@Req() req: any, @Body() body: { city: string; question: string }) {
    const userId = req.user?.id;
    return this.aiService.getWeatherAdvice(body, userId);
  }
}
