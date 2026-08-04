import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../auth/auth.guard';
import { PremiumGuard } from '../auth/premium.guard';

@UseGuards(AuthGuard, PremiumGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('welcome')
  async sendWelcome(@Req() req: any, @Body() body: { name?: string }) {
    const user = req.user;
    const name = body.name || user.user_metadata?.first_name || 'Premium Subscriber';
    return this.notificationsService.sendWelcomeEmail(user.email, name);
  }

  @Post('severe-alert')
  async sendSevereAlert(
    @Req() req: any,
    @Body() body: { city: string; alertType: string; severity: string; details: string },
  ) {
    const user = req.user;
    return this.notificationsService.sendSevereAlertEmail(
      user.email,
      body.city,
      body.alertType,
      body.severity,
      body.details,
    );
  }

  @Post('daily-digest')
  async sendDailyDigest(
    @Req() req: any,
    @Body() body: { city: string; summary: string; forecastDays: any[] },
  ) {
    const user = req.user;
    const forecast = body.forecastDays || [
      { day: 'Today', temp: 28, description: 'Sunny' },
      { day: 'Tomorrow', temp: 29, description: 'Clear' },
      { day: 'Day After', temp: 27, description: 'Partly Cloudy' },
    ];
    return this.notificationsService.sendDailyDigestEmail(
      user.email,
      body.city,
      body.summary || 'Enjoy a stable weather outlook today.',
      forecast,
    );
  }

  @Post('subscription-status')
  async sendSubscriptionStatus(
    @Req() req: any,
    @Body() body: { plan: string; action: 'created' | 'updated' | 'cancelled' },
  ) {
    const user = req.user;
    return this.notificationsService.sendSubscriptionEmail(
      user.email,
      body.plan || 'pro',
      body.action || 'created',
    );
  }
}
