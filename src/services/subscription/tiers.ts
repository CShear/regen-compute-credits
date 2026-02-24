import type { SubscriptionTier, SubscriptionTierId } from "./types.js";

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyUsd: 1,
    description: "Entry tier for monthly ecological contributions.",
    stripePriceIdEnv: "STRIPE_PRICE_ID_STARTER",
  },
  {
    id: "growth",
    name: "Growth",
    monthlyUsd: 3,
    description: "Balanced recurring contribution tier.",
    stripePriceIdEnv: "STRIPE_PRICE_ID_GROWTH",
  },
  {
    id: "impact",
    name: "Impact",
    monthlyUsd: 5,
    description: "Highest monthly contribution tier.",
    stripePriceIdEnv: "STRIPE_PRICE_ID_IMPACT",
  },
];

export function listSubscriptionTiers(): SubscriptionTier[] {
  return SUBSCRIPTION_TIERS;
}

export function getSubscriptionTier(
  tierId: SubscriptionTierId
): SubscriptionTier | undefined {
  return SUBSCRIPTION_TIERS.find((tier) => tier.id === tierId);
}

export function getStripePriceIdForTier(
  tierId: SubscriptionTierId
): string | undefined {
  const tier = getSubscriptionTier(tierId);
  if (!tier) return undefined;
  const value = process.env[tier.stripePriceIdEnv]?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function getTierIdForStripePrice(
  priceId?: string
): SubscriptionTierId | undefined {
  if (!priceId) return undefined;
  for (const tier of SUBSCRIPTION_TIERS) {
    const configured = process.env[tier.stripePriceIdEnv]?.trim();
    if (configured && configured === priceId) {
      return tier.id;
    }
  }
  return undefined;
}
