export type SubscriptionTierId = "starter" | "growth" | "impact";

export type SubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused";

export interface SubscriptionTier {
  id: SubscriptionTierId;
  name: string;
  monthlyUsd: number;
  description: string;
  stripePriceIdEnv: string;
}

export interface SubscriptionIdentityInput {
  email?: string;
  customerId?: string;
  fullName?: string;
  paymentMethodId?: string;
}

export interface SubscriptionState {
  customerId?: string;
  email?: string;
  subscriptionId?: string;
  status: SubscriptionStatus;
  tierId?: SubscriptionTierId;
  priceId?: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd?: string;
}
