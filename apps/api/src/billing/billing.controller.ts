import { Controller, Post, Get, Body, Req, Headers, UseGuards, HttpCode, HttpStatus, RawBodyRequest } from '@nestjs/common';
import { BillingService } from './billing.service';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(AuthGuard)
  @Post('checkout')
  async createCheckout(@Req() req: any, @Body() body: { plan: string; successUrl?: string; cancelUrl?: string }) {
    const user = req.user;
    return this.billingService.createCheckoutSession(
      user.id,
      user.email,
      body.plan || 'pro',
      body.successUrl,
      body.cancelUrl,
    );
  }

  @UseGuards(AuthGuard)
  @Get('subscription')
  async getSubscription(@Req() req: any) {
    const user = req.user;
    return this.billingService.getSubscriptionStatus(user.id);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
    @Body() body: any,
  ) {
    // If webhook signature exists, verify with rawBody, otherwise fallback to parsed body
    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(body);
    return this.billingService.handleWebhook(rawBody, signature);
  }
}
