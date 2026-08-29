import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PaddleService {
  private readonly logger = new Logger(PaddleService.name);
  private readonly isProduction: boolean;
  private readonly fallbackFilePath = path.join(__dirname, '..', '..', '..', 'subscription-store.json');

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
  }

  /**
   * Verifies the cryptographic HMAC-SHA256 signature of a Paddle Billing webhook.
   *
   * Format of Paddle-Signature header: ts=123456789;h1=hash_in_hex
   * Signed payload: `${ts}:${rawBody}`
   */
  verifyWebhookSignature(rawBody: Buffer | undefined, signatureHeader: string | undefined): boolean {
    const webhookSecret = this.configService.get<string>('PADDLE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      this.logger.warn('PADDLE_WEBHOOK_SECRET is not configured on this server.');
      return false;
    }

    if (!rawBody || !signatureHeader) {
      this.logger.warn('Missing raw body or Paddle-Signature header.');
      return false;
    }

    try {
      const parts = signatureHeader.split(';');
      let tsStr: string | undefined;
      let h1: string | undefined;

      for (const part of parts) {
        const [key, val] = part.split('=');
        if (key?.trim() === 'ts') tsStr = val?.trim();
        if (key?.trim() === 'h1') h1 = val?.trim();
      }

      if (!tsStr || !h1) {
        this.logger.warn('Malformed Paddle-Signature header format.');
        return false;
      }

      const ts = parseInt(tsStr, 10);
      if (isNaN(ts)) {
        this.logger.warn('Invalid timestamp in Paddle-Signature header.');
        return false;
      }

      // Replay attack prevention: verify timestamp within 5 minutes (300 seconds)
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - ts) > 300) {
        this.logger.warn(`Paddle webhook timestamp expired or out of tolerance (ts: ${ts}, now: ${now}).`);
        return false;
      }

      const signedPayload = `${ts}:${rawBody.toString('utf8')}`;
      const computedHmac = crypto
        .createHmac('sha256', webhookSecret)
        .update(signedPayload)
        .digest('hex');

      if (computedHmac.length !== h1.length) {
        return false;
      }

      return crypto.timingSafeEqual(Buffer.from(computedHmac, 'hex'), Buffer.from(h1, 'hex'));
    } catch (err) {
      this.logger.error(`Error during Paddle signature verification: ${err.message}`);
      return false;
    }
  }

  /**
   * Updates user subscription status in Supabase securely using privileged admin client.
   */
  async updateEntitlement(
    userId: string,
    isPremium: boolean,
    planName: string,
    status: string,
  ) {
    if (!userId) return false;

    const supabase = this.supabaseService.getAdminClient() ?? this.supabaseService.getClient();
    let dbUpdated = false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_premium: isPremium,
          plan_name: planName,
        })
        .eq('id', userId);

      if (error) {
        this.logger.error(`Failed to update Supabase profile entitlement: ${error.message}`);
      } else {
        dbUpdated = true;
        this.logger.log(`Updated user ${userId} entitlement: is_premium=${isPremium}, plan=${planName}, status=${status}`);
      }
    } catch (err) {
      this.logger.error(`Exception during Supabase entitlement update: ${err.message}`);
    }

    if (!this.isProduction) {
      try {
        let store: Record<string, any> = {};
        if (fs.existsSync(this.fallbackFilePath)) {
          store = JSON.parse(fs.readFileSync(this.fallbackFilePath, 'utf8'));
        }
        store[userId] = { isPremium, plan: planName, status };
        fs.writeFileSync(this.fallbackFilePath, JSON.stringify(store, null, 2), 'utf8');
      } catch (err) {
        this.logger.warn(`Could not update dev fallback store: ${err.message}`);
      }
    }

    return dbUpdated;
  }

  /**
   * Handles incoming Paddle Billing webhook events with full subscription lifecycle.
   */
  async handleWebhook(rawBody: Buffer | undefined, signature: string | undefined) {
    const isValid = this.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or missing Paddle webhook signature.');
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody!.toString('utf8'));
    } catch (err) {
      throw new BadRequestException('Webhook payload could not be parsed as JSON.');
    }

    const eventType = payload.event_type;
    const data = payload.data;

    this.logger.log(`Processing verified Paddle webhook event: ${eventType} (id: ${payload.event_id || 'n/a'})`);

    const userId = data?.custom_data?.userId || data?.customData?.userId;
    const status = data?.status;

    switch (eventType) {
      case 'subscription.created':
      case 'subscription.activated': {
        if (userId) {
          const isEligible = status === 'active' || status === 'trialing';
          await this.updateEntitlement(userId, isEligible, 'pro', status || 'active');
        } else {
          this.logger.warn('Paddle subscription event missing custom_data.userId; entitlement not linked.');
        }
        break;
      }

      case 'subscription.updated': {
        if (userId) {
          const isEligible = status === 'active' || status === 'trialing';
          await this.updateEntitlement(userId, isEligible, isEligible ? 'pro' : 'free', status);
        }
        break;
      }

      case 'subscription.canceled':
      case 'subscription.past_due':
      case 'subscription.paused': {
        if (userId) {
          await this.updateEntitlement(userId, false, 'free', status || 'canceled');
        }
        break;
      }

      case 'transaction.completed': {
        if (userId && data?.status === 'completed') {
          await this.updateEntitlement(userId, true, 'pro', 'active');
        }
        break;
      }

      default:
        this.logger.log(`Unhandled Paddle event type: ${eventType}`);
    }

    return { received: true };
  }
}
