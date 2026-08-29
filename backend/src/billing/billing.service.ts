import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import Stripe from 'stripe';
import * as fs from 'fs';
import * as path from 'path';
import { BILLING_PLANS } from './billing.config';

// Only these plans may ever reach the database. Anything else is rejected so a
// forged or malformed value can never be written into profiles.plan_name.
export const ALLOWED_PLANS = ['free', 'pro', 'enterprise'] as const;
export type AllowedPlan = (typeof ALLOWED_PLANS)[number];

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe.Stripe | null = null;
  private readonly isProduction: boolean;
  private readonly fallbackFilePath = path.join(__dirname, '..', '..', 'subscription-store.json');

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    const stripeSecret = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeSecret) {
      this.stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' as any });
      this.logger.log('Optional Stripe billing integration initialized.');
    }
  }

  private isPlanAllowed(plan: string): plan is AllowedPlan {
    return (ALLOWED_PLANS as readonly string[]).includes(plan);
  }

  // ---------------------------------------------------------------------------
  // Local fallback store.
  //
  // This file is a DEVELOPMENT convenience only. It is never consulted or
  // written in production, because a writable JSON file must not be able to
  // decide who is a paying customer.
  // ---------------------------------------------------------------------------
  private readFallbackStore(): Record<string, { isPremium: boolean; plan: string; status: string }> {
    if (this.isProduction) return {};
    try {
      if (fs.existsSync(this.fallbackFilePath)) {
        return JSON.parse(fs.readFileSync(this.fallbackFilePath, 'utf8'));
      }
    } catch (err) {
      this.logger.error(`Error reading fallback subscription store: ${err.message}`);
    }
    return {};
  }

  private writeFallbackStore(store: Record<string, { isPremium: boolean; plan: string; status: string }>) {
    if (this.isProduction) return;
    try {
      fs.writeFileSync(this.fallbackFilePath, JSON.stringify(store, null, 2), 'utf8');
    } catch (err) {
      this.logger.error(`Error writing fallback subscription store: ${err.message}`);
    }
  }

  getPublicPlans() {
    return BILLING_PLANS;
  }

  async createCheckoutSession(
    userId: string,
    email: string,
    planInput: string,
    intervalInput?: string,
    successUrl?: string,
    cancelUrl?: string,
  ) {
    let plan = planInput;
    let interval = intervalInput;

    if (planInput === 'monthly') {
      plan = 'pro';
      interval = 'month';
    } else if (planInput === 'yearly') {
      plan = 'pro';
      interval = 'year';
    }

    if (!this.isPlanAllowed(plan) || plan === 'free') {
      throw new BadRequestException(`Unsupported plan: ${planInput}`);
    }

    if (!this.stripe) {
      throw new ServiceUnavailableException(
        'Payments are currently pending merchant account configuration. Please configure Stripe or CMI credentials.',
      );
    }

    const isYearly = interval === 'yearly' || interval === 'year';
    const planKey = isYearly ? 'pro_yearly' : 'pro_monthly';
    const planConfig = BILLING_PLANS[planKey] || BILLING_PLANS.pro_monthly;

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: planConfig.currency,
              product_data: { name: planConfig.name },
              unit_amount: planConfig.unitAmount,
              recurring: { interval: planConfig.interval || 'month' },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url:
          successUrl || 'http://localhost:5173/premium?success=true&session_id={CHECKOUT_SESSION_ID}',
        cancel_url: cancelUrl || 'http://localhost:5173/premium?cancel=true',
        customer_email: email,
        metadata: { userId, plan, interval: isYearly ? 'yearly' : 'monthly' },
      });

      return { url: session.url, sessionId: session.id };
    } catch (err) {
      this.logger.error(`Stripe checkout session creation failed: ${err.message}`);
      throw new ServiceUnavailableException('Could not start a checkout session. Please try again.');
    }
  }

  async createCustomerPortalSession(userId: string, returnUrl?: string) {
    if (!this.stripe) {
      throw new ServiceUnavailableException('Customer portal is not available without configured billing.');
    }

    const status = await this.getSubscriptionStatus(userId);
    if (!status.isPremium) {
      throw new BadRequestException('No active premium subscription found for this user.');
    }

    // Try finding customer via Stripe or fall back
    try {
      const supabase = this.supabaseService.getClient();
      const { data } = await supabase.from('profiles').select('email').eq('id', userId).maybeSingle();
      const email = data?.email;

      let customerId: string | null = null;
      if (email) {
        const customers = await this.stripe.customers.list({ email, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        }
      }

      if (!customerId) {
        throw new BadRequestException('No Stripe customer profile found for this account.');
      }

      const portalSession = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl || 'http://localhost:5173/premium',
      });

      return { url: portalSession.url };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error(`Failed to create customer portal session: ${err.message}`);
      throw new ServiceUnavailableException('Could not open customer portal.');
    }
  }

  async getSubscriptionStatus(userId: string) {
    const supabase = this.supabaseService.getClient();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_premium, plan_name')
        .eq('id', userId)
        .maybeSingle();

      if (!error) {
        return {
          isPremium: !!data?.is_premium,
          plan: data?.plan_name || 'free',
          status: data?.is_premium ? 'active' : 'none',
        };
      }

      this.logger.warn(`Subscription read failed for user: ${error.message}`);
    } catch (dbError) {
      this.logger.warn(`Database subscription fetch threw: ${dbError.message}`);
    }

    if (this.isProduction) {
      return { isPremium: false, plan: 'free', status: 'none' };
    }

    const store = this.readFallbackStore();
    return store[userId] || { isPremium: false, plan: 'free', status: 'none' };
  }

  /**
   * Writes entitlement. PRIVATE BY DESIGN: it is only reachable from a
   * signature-verified payment webhook event.
   */
  private async updateSubscription(
    userId: string,
    isPremium: boolean,
    plan: string,
    status: string,
  ) {
    if (!this.isPlanAllowed(plan)) {
      throw new BadRequestException(`Refusing to write unknown plan: ${plan}`);
    }

    const supabase = this.supabaseService.getAdminClient() ?? this.supabaseService.getClient();
    if (!this.supabaseService.hasAdminClient()) {
      this.logger.warn(
        'Writing entitlement with the publishable key because SUPABASE_SERVICE_ROLE_KEY is unset.',
      );
    }

    let dbUpdated = false;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_premium: isPremium, plan_name: plan })
        .eq('id', userId);

      if (error) {
        this.logger.error(`Failed to update profile subscription: ${error.message}`);
      } else {
        dbUpdated = true;
      }
    } catch (dbError) {
      this.logger.error(`Database subscription update threw: ${dbError.message}`);
    }

    if (!this.isProduction) {
      const store = this.readFallbackStore();
      store[userId] = { isPremium, plan, status };
      this.writeFallbackStore(store);
    }

    if (!dbUpdated && this.isProduction) {
      throw new ServiceUnavailableException('Could not record the subscription change.');
    }

    return { success: dbUpdated, dbUpdated };
  }

  /**
   * Processes a payment webhook. Verified cryptographic signature is MANDATORY.
   */
  async handleWebhook(rawBody: Buffer | undefined, signature: string | undefined) {
    const endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!this.stripe || !endpointSecret) {
      this.logger.warn('Rejected webhook: Stripe is not configured on this server.');
      throw new ServiceUnavailableException('Webhook processing is not configured.');
    }

    if (!signature) {
      this.logger.warn('Rejected webhook: missing stripe-signature header.');
      throw new UnauthorizedException('Missing stripe-signature header.');
    }

    if (!rawBody) {
      this.logger.error('Rejected webhook: raw request body unavailable.');
      throw new BadRequestException('Raw request body unavailable.');
    }

    let event: ReturnType<Stripe.Stripe['webhooks']['constructEvent']>;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    } catch (err) {
      this.logger.warn(`Rejected webhook: signature verification failed: ${err.message}`);
      throw new UnauthorizedException('Invalid webhook signature.');
    }

    this.logger.log(`Processing verified Stripe webhook event: ${event.type}`);

    // Handle full recurring subscription lifecycle
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as { metadata?: Record<string, string> | null };
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan || 'pro';

        if (userId && this.isPlanAllowed(plan)) {
          await this.updateSubscription(userId, true, plan, 'active');
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as { subscription_details?: any; metadata?: Record<string, string> | null };
        const userId = invoice.metadata?.userId;
        if (userId) {
          await this.updateSubscription(userId, true, 'pro', 'active');
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as { metadata?: Record<string, string> | null };
        const userId = invoice.metadata?.userId;
        if (userId) {
          await this.updateSubscription(userId, false, 'pro', 'past_due');
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as { status: string; metadata?: Record<string, string> | null };
        const userId = subscription.metadata?.userId;
        if (userId) {
          const isEligible = subscription.status === 'active' || subscription.status === 'trialing';
          await this.updateSubscription(userId, isEligible, isEligible ? 'pro' : 'free', subscription.status);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as { metadata?: Record<string, string> | null };
        const userId = subscription.metadata?.userId;
        if (userId) {
          await this.updateSubscription(userId, false, 'free', 'canceled');
        }
        break;
      }

      default:
        this.logger.log(`Unhandled verified webhook event: ${event.type}`);
    }

    return { received: true };
  }
}
