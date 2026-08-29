import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { PaddleService } from './paddle/paddle.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly paddleService: PaddleService,
  ) {}

  @Get('plans')
  getPlans() {
    return this.billingService.getPublicPlans();
  }

  @UseGuards(AuthGuard)
  @Post('checkout')
  async createCheckout(@Req() req: any, @Body() body: CreateCheckoutDto) {
    // userId and email come from the AuthGuard-verified token, never the body.
    const user = req.user;
    return this.billingService.createCheckoutSession(
      user.id,
      user.email,
      body.plan,
      body.interval,
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

  @UseGuards(AuthGuard)
  @Post('portal')
  async openCustomerPortal(@Req() req: any, @Body('returnUrl') returnUrl?: string) {
    const user = req.user;
    return this.billingService.createCustomerPortalSession(user.id, returnUrl);
  }

  /**
   * Paddle Billing webhook. Verifies Paddle-Signature over rawBody buffer.
   */
  @Post('paddle/webhook')
  @HttpCode(HttpStatus.OK)
  async handlePaddleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('paddle-signature') signature: string,
  ) {
    return this.paddleService.handleWebhook(req.rawBody, signature);
  }

  /**
   * Stripe webhook. Deliberately unauthenticated at the HTTP layer because
   * Stripe cannot present a bearer token — authenticity comes from the
   * signature over the RAW body, which the service now requires.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    // Only the raw buffer is passed. Re-serializing a parsed body would change
    // the bytes and make signature verification meaningless.
    return this.billingService.handleWebhook(req.rawBody, signature);
  }
}
