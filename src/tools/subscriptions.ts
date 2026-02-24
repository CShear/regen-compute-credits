import { StripeSubscriptionService } from "../services/subscription/stripe.js";
import { SubscriptionPoolSyncService } from "../services/subscription/pool-sync.js";
import type {
  SubscriptionIdentityInput,
  SubscriptionState,
  SubscriptionTierId,
} from "../services/subscription/types.js";

const subscriptions = new StripeSubscriptionService();
const poolSync = new SubscriptionPoolSyncService();

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

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function renderPoolSyncResult(
  title: string,
  result: {
    scope: "customer" | "all_customers";
    customerId?: string;
    email?: string;
    month?: string;
    truncated?: boolean;
    hasMore?: boolean;
    pageCount?: number;
    maxPages?: number;
    fetchedInvoiceCount: number;
    processedInvoiceCount: number;
    syncedCount: number;
    duplicateCount: number;
    skippedCount: number;
    records: Array<{
      invoiceId: string;
      contributionId: string;
      amountUsdCents: number;
      duplicated: boolean;
      paidAt: string;
    }>;
  }
): string {
  const lines: string[] = [
    `## ${title}`,
    "",
    "| Field | Value |",
    "|-------|-------|",
    `| Scope | ${result.scope === "all_customers" ? "all_customers" : "customer"} |`,
    `| Customer ID | ${result.customerId || "N/A"} |`,
    `| Email | ${result.email || "N/A"} |`,
    `| Month Filter | ${result.month || "none"} |`,
    `| Invoices Fetched | ${result.fetchedInvoiceCount} |`,
    `| Invoices Processed | ${result.processedInvoiceCount} |`,
    `| Synced | ${result.syncedCount} |`,
    `| Duplicates | ${result.duplicateCount} |`,
    `| Skipped (month filter) | ${result.skippedCount} |`,
  ];

  if (result.scope === "all_customers") {
    lines.push(
      `| Pages Fetched | ${typeof result.pageCount === "number" ? result.pageCount : "N/A"} |`,
      `| Max Pages | ${typeof result.maxPages === "number" ? result.maxPages : "N/A"} |`,
      `| Fetch Truncated | ${result.truncated ? "Yes" : "No"} |`
    );
  }

  if (result.records.length > 0) {
    lines.push(
      "",
      "### Processed Invoices",
      "",
      "| Invoice ID | Contribution ID | Amount | Duplicate | Paid At |",
      "|------------|------------------|--------|-----------|---------|",
      ...result.records.map(
        (record) =>
          `| ${record.invoiceId} | ${record.contributionId} | ${formatMoney(record.amountUsdCents)} | ${record.duplicated ? "Yes" : "No"} | ${record.paidAt} |`
      )
    );
  } else {
    lines.push("", "No paid invoices matched the provided filter.");
  }

  if (result.scope === "all_customers" && result.truncated) {
    lines.push(
      "",
      "Warning: invoice fetch stopped before Stripe pagination was exhausted. Increase `max_pages` and rerun to complete reconciliation."
    );
  }

  return lines.join("\n");
}

export async function syncSubscriptionPoolContributionsTool(
  month?: string,
  email?: string,
  customerId?: string,
  userId?: string,
  limit?: number
) {
  try {
    const result = await poolSync.syncPaidInvoices({
      month,
      email,
      customerId,
      userId,
      limit,
    });
    return {
      content: [
        {
          type: "text" as const,
          text: renderPoolSyncResult("Subscription Pool Sync", result),
        },
      ],
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown sync error occurred";
    return {
      content: [
        {
          type: "text" as const,
          text: `Subscription pool sync failed: ${message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function syncAllSubscriptionPoolContributionsTool(
  month?: string,
  limit?: number,
  maxPages?: number
) {
  try {
    const result = await poolSync.syncPaidInvoices({
      month,
      limit,
      maxPages,
      allCustomers: true,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: renderPoolSyncResult("All-Customer Subscription Pool Sync", result),
        },
      ],
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown sync error occurred";
    return {
      content: [
        {
          type: "text" as const,
          text: `All-customer subscription pool sync failed: ${message}`,
        },
      ],
      isError: true,
    };
  }
}
