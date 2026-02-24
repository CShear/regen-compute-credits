import { PoolAccountingService } from "../pool-accounting/service.js";
import { StripeSubscriptionService } from "./stripe.js";
import { getTierIdForStripePrice } from "./tiers.js";
import type { SubscriptionIdentityInput } from "./types.js";

const MONTH_REGEX = /^\d{4}-\d{2}$/;

function normalize(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeEmail(value?: string): string | undefined {
  const email = normalize(value);
  return email ? email.toLowerCase() : undefined;
}

export interface SubscriptionPoolSyncInput extends SubscriptionIdentityInput {
  userId?: string;
  month?: string;
  limit?: number;
  maxPages?: number;
  allCustomers?: boolean;
}

export interface SyncedSubscriptionContribution {
  invoiceId: string;
  contributionId: string;
  duplicated: boolean;
  amountUsdCents: number;
  paidAt: string;
}

export interface SubscriptionPoolSyncResult {
  scope: "customer" | "all_customers";
  customerId?: string;
  email?: string;
  month?: string;
  fetchedInvoiceCount: number;
  processedInvoiceCount: number;
  syncedCount: number;
  duplicateCount: number;
  skippedCount: number;
  records: SyncedSubscriptionContribution[];
}

export class SubscriptionPoolSyncService {
  constructor(
    private readonly subscriptions: Pick<
      StripeSubscriptionService,
      "listPaidInvoices" | "listPaidInvoicesAcrossCustomers"
    > = new StripeSubscriptionService(),
    private readonly poolAccounting: PoolAccountingService = new PoolAccountingService()
  ) {}

  async syncPaidInvoices(
    input: SubscriptionPoolSyncInput
  ): Promise<SubscriptionPoolSyncResult> {
    const identity: SubscriptionIdentityInput = {
      customerId: normalize(input.customerId),
      email: normalizeEmail(input.email),
    };
    const userId = normalize(input.userId);
    const month = normalize(input.month);
    const allCustomers = Boolean(input.allCustomers);

    if (!allCustomers && !identity.customerId && !identity.email) {
      throw new Error("Provide at least one of customerId or email");
    }
    if (month && !MONTH_REGEX.test(month)) {
      throw new Error("month must be in YYYY-MM format");
    }

    const fetched = allCustomers
      ? await this.subscriptions.listPaidInvoicesAcrossCustomers({
          limit: input.limit,
          maxPages: input.maxPages,
        })
      : await this.subscriptions.listPaidInvoices(identity, {
          limit: input.limit,
        });
    const invoices = month
      ? fetched.filter((invoice) => invoice.paidAt.slice(0, 7) === month)
      : fetched;

    const records: SyncedSubscriptionContribution[] = [];
    let syncedCount = 0;
    let duplicateCount = 0;

    for (const invoice of invoices) {
      const tierId = getTierIdForStripePrice(invoice.priceId);
      const receipt = await this.poolAccounting.recordContribution({
        userId,
        email: invoice.customerEmail || identity.email,
        customerId: invoice.customerId || identity.customerId,
        subscriptionId: invoice.subscriptionId,
        externalEventId: `stripe_invoice:${invoice.invoiceId}`,
        amountUsdCents: invoice.amountPaidCents,
        contributedAt: invoice.paidAt,
        source: "subscription",
        tierId,
        metadata: {
          stripe_invoice_id: invoice.invoiceId,
          stripe_price_id: invoice.priceId || "",
          synced_by: allCustomers
            ? "sync_all_subscription_pool_contributions"
            : "sync_subscription_pool_contributions",
        },
      });

      if (receipt.duplicate) {
        duplicateCount += 1;
      } else {
        syncedCount += 1;
      }

      records.push({
        invoiceId: invoice.invoiceId,
        contributionId: receipt.record.id,
        duplicated: receipt.duplicate,
        amountUsdCents: receipt.record.amountUsdCents,
        paidAt: receipt.record.contributedAt,
      });
    }

    return {
      scope: allCustomers ? "all_customers" : "customer",
      customerId:
        invoices[0]?.customerId || fetched[0]?.customerId || identity.customerId,
      email: identity.email || invoices[0]?.customerEmail || fetched[0]?.customerEmail,
      month,
      fetchedInvoiceCount: fetched.length,
      processedInvoiceCount: invoices.length,
      syncedCount,
      duplicateCount,
      skippedCount: fetched.length - invoices.length,
      records,
    };
  }
}
