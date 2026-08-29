import { IsIn, IsOptional, IsUrl } from 'class-validator';
import { ALLOWED_PLANS } from '../billing.service';

const PURCHASABLE_PLANS = ALLOWED_PLANS.filter((plan) => plan !== 'free');
const VALID_PLAN_INPUTS = [...PURCHASABLE_PLANS, 'monthly', 'yearly'];

export class CreateCheckoutDto {
  @IsIn(VALID_PLAN_INPUTS, { message: `plan must be one of: ${VALID_PLAN_INPUTS.join(', ')}` })
  plan: string;

  @IsOptional()
  @IsIn(['monthly', 'yearly', 'month', 'year'], { message: 'interval must be monthly or yearly' })
  interval?: string;

  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'successUrl must be a valid URL' })
  successUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'cancelUrl must be a valid URL' })
  cancelUrl?: string;
}
