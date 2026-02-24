import { StripeSubscriptionService } from "../services/subscription/stripe.js";
import type {
  SubscriptionIdentityInput,
  SubscriptionState,
  SubscriptionTierId,
} from "../services/subscription/types.js";

const subscriptions = new StripeSubscriptionService();

function renderState(title: string, state: SubscriptionState): string {
  const lines: string[] = [
    `## ${title}`,
    ``,
    `| Field | Value |`,
    `|-------|-------|`,
    `| Customer ID | ${state.customerId || "N/A"} |`,
    `| Status | ${state.status} |`,
    `| Tier | ${state.tierId || "N/A"} |`,
    `| Stripe Price | ${state.priceId || "N/A"} |`,
    `| Cancel At Period End | ${state.cancelAtPeriodEnd ? "Yes" : "No"} |`,
    `| Current Period End | ${state.currentPeriodEnd || "N/A"} |`,
  ];

  if (state.email) {
    lines.splice(4, 0, `| Email | ${state.email} |`);
  }

  if (state.status === "none") {
    lines.push(
      ``,
      `No active subscription was found for the provided customer/email.`
    );
  }

  return lines.join("\n");
}

function normalizeIdentity(
  email?: string,
  customerId?: string,
  fullName?: string,
  paymentMethodId?: string
): SubscriptionIdentityInput {
  return {
    email: email?.trim() || undefined,
    customerId: customerId?.trim() || undefined,
    fullName: fullName?.trim() || undefined,
    paymentMethodId: paymentMethodId?.trim() || undefined,
  };
}

export async function listSubscriptionTiersTool() {
  try {
    const tiers = subscriptions.listTiers();
    const lines = [
      "## Subscription Tiers",
      "",
      "| Tier | Name | Monthly Price | Description | Stripe Price Config |",
      "|------|------|---------------|-------------|---------------------|",
      ...tiers.map(
        (tier) =>
          `| ${tier.id} | ${tier.name} | $${tier.monthlyUsd}/month | ${tier.description} | ${process.env[tier.stripePriceIdEnv] ? "Configured" : `Missing (${tier.stripePriceIdEnv})`} |`
      ),
      "",
      "Supported plan IDs: `starter`, `growth`, `impact`.",
    ];

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      content: [{ type: "text" as const, text: `Error listing tiers: ${message}` }],
      isError: true,
    };
  }
}

export async function manageSubscriptionTool(
  action: "subscribe" | "status" | "cancel",
  tier?: SubscriptionTierId,
  email?: string,
  customerId?: string,
  fullName?: string,
  paymentMethodId?: string
) {
  try {
    const identity = normalizeIdentity(email, customerId, fullName, paymentMethodId);

    if (!identity.email && !identity.customerId) {
      return {
        content: [
          {
            type: "text" as const,
            text:
              "Provide at least one of `email` or `customer_id` to manage subscriptions.",
          },
        ],
        isError: true,
      };
    }

    if (action === "status") {
      const state = await subscriptions.getSubscriptionState(identity);
      return {
        content: [{ type: "text" as const, text: renderState("Subscription Status", state) }],
      };
    }

    if (action === "cancel") {
      const state = await subscriptions.cancelSubscription(identity);
      return {
        content: [{ type: "text" as const, text: renderState("Subscription Canceled", state) }],
      };
    }

    if (!tier) {
      return {
        content: [
          {
            type: "text" as const,
            text:
              "For `subscribe`, you must provide a `tier` (`starter`, `growth`, or `impact`).",
          },
        ],
        isError: true,
      };
    }

    const state = await subscriptions.ensureSubscription(tier, identity);
    return {
      content: [{ type: "text" as const, text: renderState("Subscription Updated", state) }],
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      content: [
        {
          type: "text" as const,
          text: `Subscription operation failed: ${message}`,
        },
      ],
      isError: true,
    };
  }
}
