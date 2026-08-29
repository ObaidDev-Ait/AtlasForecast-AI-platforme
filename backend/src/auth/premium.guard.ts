import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { BillingService } from '../billing/billing.service';

@Injectable()
export class PremiumGuard implements CanActivate {
  constructor(private readonly billingService: BillingService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }

    const sub = await this.billingService.getSubscriptionStatus(user.id);
    if (!sub.isPremium) {
      throw new ForbiddenException('Premium subscription required to access this resource');
    }

    return true;
  }
}
