import {
  getStripePriceIdForTier,
  getTierIdForStripePrice,
  listSubscriptionTiers,
} from "./tiers.js";
import type {
  SubscriptionIdentityInput,
  SubscriptionState,
  SubscriptionStatus,
  SubscriptionTier,
  SubscriptionTierId,
} from "./types.js";

const STRIPE_API_BASE = "https://api.stripe.com/v1";

interface StripeErrorPayload {
  error?: {
    message?: string;
    code?: string;
    type?: string;
  };
}

interface StripeCustomer {
  id: string;
  email?: string;
  name?: string;
  deleted?: boolean;
}

interface StripePrice {
  id: string;
}

interface StripeSubscriptionItem {
  id: string;
  price?: StripePrice;
}

interface StripeInvoiceLine {
  id?: string;
  price?: StripePrice;
}

interface StripeInvoice {
  id: string;
  customer?: string;
  customer_email?: string;
  subscription?: string;
  amount_paid?: number;
  currency?: string;
  status_transitions?: {
    paid_at?: number | null;
  };
  lines?: {
    data: StripeInvoiceLine[];
  };
}

interface StripeSubscription {
  id: string;
  status: string;
  customer: string;
  cancel_at_period_end: boolean;
  current_period_end?: number;
  items?: {
    data: StripeSubscriptionItem[];
  };
}

interface StripeListResponse<T> {
  data: T[];
  has_more?: boolean;
}

export interface PaidInvoice {
  invoiceId: string;
  customerId: string;
  customerEmail?: string;
  subscriptionId?: string;
  priceId?: string;
  amountPaidCents: number;
  paidAt: string;
}

export interface PaidInvoiceAcrossCustomersResult {
  invoices: PaidInvoice[];
  truncated: boolean;
  hasMore: boolean;
  pageCount: number;
  maxPages: number;
}

function trimOrUndefined(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function encodeForm(
  data: Record<string, string | number | boolean | undefined>
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    params.append(key, String(value));
  }
  return params.toString();
}

function mapStripeStatus(status: string | undefined): SubscriptionStatus {
  if (!status) return "none";
  switch (status) {
    case "trialing":
    case "active":
    case "past_due":
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "unpaid":
    case "paused":
      return status;
    default:
      return "none";
  }
}

function pickSubscription(
  subscriptions: StripeSubscription[]
): StripeSubscription | undefined {
  const priority: SubscriptionStatus[] = [
    "active",
    "trialing",
    "past_due",
    "incomplete",
    "unpaid",
    "paused",
    "canceled",
    "incomplete_expired",
  ];

  const normalized = subscriptions
    .map((sub) => ({
      sub,
      status: mapStripeStatus(sub.status),
      idx: priority.indexOf(mapStripeStatus(sub.status)),
    }))
    .sort((a, b) => {
      const aIdx = a.idx === -1 ? Number.MAX_SAFE_INTEGER : a.idx;
      const bIdx = b.idx === -1 ? Number.MAX_SAFE_INTEGER : b.idx;
      return aIdx - bIdx;
    });

  return normalized[0]?.sub;
}

function toState(
  customer: StripeCustomer | undefined,
  subscription: StripeSubscription | undefined
): SubscriptionState {
  if (!subscription) {
    return {
      customerId: customer?.id,
      email: customer?.email,
      status: "none",
      cancelAtPeriodEnd: false,
    };
  }

  const item = subscription.items?.data[0];
  const priceId = item?.price?.id;
  const tierId = getTierIdForStripePrice(priceId);
  const currentPeriodEnd =
    subscription.current_period_end && subscription.current_period_end > 0
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : undefined;

  return {
    customerId: customer?.id || subscription.customer,
    email: customer?.email,
    subscriptionId: subscription.id,
    status: mapStripeStatus(subscription.status),
    tierId,
    priceId,
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    currentPeriodEnd,
  };
}

export class StripeSubscriptionService {
  listTiers(): SubscriptionTier[] {
    return listSubscriptionTiers();
  }

  private getSecretKey(): string {
    const key = trimOrUndefined(process.env.STRIPE_SECRET_KEY);
    if (!key) {
      throw new Error("Missing STRIPE_SECRET_KEY for Stripe subscriptions");
    }
    return key;
  }

  private getDefaultPaymentMethodId(
    input?: SubscriptionIdentityInput
  ): string | undefined {
    return (
      trimOrUndefined(input?.paymentMethodId) ||
      trimOrUndefined(process.env.STRIPE_PAYMENT_METHOD_ID)
    );
  }

  private async stripeRequest<T>(
    method: "GET" | "POST",
    path: string,
    fields?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const secretKey = this.getSecretKey();
    const url =
      method === "GET" && fields
        ? `${STRIPE_API_BASE}${path}?${encodeForm(fields)}`
        : `${STRIPE_API_BASE}${path}`;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        ...(method === "POST"
          ? { "Content-Type": "application/x-www-form-urlencoded" }
          : {}),
      },
      body: method === "POST" ? encodeForm(fields || {}) : undefined,
    });

    const payload = (await response.json()) as T | StripeErrorPayload;
    if (!response.ok) {
      const err = (payload as StripeErrorPayload).error;
      const code = err?.code ? ` (${err.code})` : "";
      throw new Error(err?.message ? `${err.message}${code}` : "Stripe API error");
    }

    return payload as T;
  }

  private async findCustomer(
    input: SubscriptionIdentityInput
  ): Promise<StripeCustomer | undefined> {
    const customerId = trimOrUndefined(input.customerId);
    if (customerId) {
      const customer = await this.stripeRequest<StripeCustomer>(
        "GET",
        `/customers/${customerId}`
      );
      return customer.deleted ? undefined : customer;
    }

    const email = trimOrUndefined(input.email);
    if (!email) return undefined;

    const list = await this.stripeRequest<StripeListResponse<StripeCustomer>>(
      "GET",
      "/customers",
      {
        email,
        limit: 1,
      }
    );
    const customer = list.data[0];
    if (!customer || customer.deleted) return undefined;
    return customer;
  }

  private async createCustomer(
    input: SubscriptionIdentityInput
  ): Promise<StripeCustomer> {
    const email = trimOrUndefined(input.email);
    if (!email) {
      throw new Error("email is required to create a Stripe customer");
    }

    return this.stripeRequest<StripeCustomer>("POST", "/customers", {
      email,
      name: trimOrUndefined(input.fullName),
      "metadata[integration]": "regen-compute-credits",
    });
  }

  private async resolveCustomer(
    input: SubscriptionIdentityInput,
    createIfMissing: boolean
  ): Promise<StripeCustomer | undefined> {
    const existing = await this.findCustomer(input);
    if (existing) return existing;
    if (!createIfMissing) return undefined;
    return this.createCustomer(input);
  }

  private async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<void> {
    try {
      await this.stripeRequest(
        "POST",
        `/payment_methods/${paymentMethodId}/attach`,
        { customer: customerId }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : "";
      if (!message.includes("already been attached")) {
        throw err;
      }
    }

    await this.stripeRequest("POST", `/customers/${customerId}`, {
      "invoice_settings[default_payment_method]": paymentMethodId,
    });
  }

  private async listCustomerSubscriptions(
    customerId: string
  ): Promise<StripeSubscription[]> {
    const list = await this.stripeRequest<StripeListResponse<StripeSubscription>>(
      "GET",
      "/subscriptions",
      {
        customer: customerId,
        status: "all",
        limit: 100,
      }
    );
    return list.data;
  }

  private clampInvoiceFetchLimit(rawLimit?: number): number {
    return typeof rawLimit === "number" && Number.isInteger(rawLimit)
      ? Math.min(100, Math.max(1, rawLimit))
      : 100;
  }

  private normalizePaidInvoice(
    invoice: StripeInvoice,
    fallbackCustomer?: StripeCustomer
  ): PaidInvoice | null {
    const paidAtEpoch = invoice.status_transitions?.paid_at;
    const amountPaidCents = invoice.amount_paid;
    const currency = (invoice.currency || "").toLowerCase();
    const customerId = invoice.customer || fallbackCustomer?.id;

    if (
      !customerId ||
      !paidAtEpoch ||
      !amountPaidCents ||
      amountPaidCents <= 0 ||
      currency !== "usd"
    ) {
      return null;
    }

    const paidAtIso = new Date(paidAtEpoch * 1000).toISOString();
    const linePriceId = invoice.lines?.data?.[0]?.price?.id;

    return {
      invoiceId: invoice.id,
      customerId,
      customerEmail: invoice.customer_email || fallbackCustomer?.email,
      subscriptionId: invoice.subscription,
      priceId: linePriceId,
      amountPaidCents,
      paidAt: paidAtIso,
    };
  }

  async ensureSubscription(
    tierId: SubscriptionTierId,
    input: SubscriptionIdentityInput
  ): Promise<SubscriptionState> {
    const priceId = getStripePriceIdForTier(tierId);
    if (!priceId) {
      throw new Error(`Missing Stripe price config for tier '${tierId}'`);
    }

    const customer = await this.resolveCustomer(input, true);
    if (!customer) {
      throw new Error("Unable to resolve Stripe customer");
    }

    const paymentMethodId = this.getDefaultPaymentMethodId(input);
    if (!paymentMethodId) {
      throw new Error(
        "Missing Stripe payment method. Set STRIPE_PAYMENT_METHOD_ID or provide payment_method_id."
      );
    }
    await this.setDefaultPaymentMethod(customer.id, paymentMethodId);

    const subscriptions = await this.listCustomerSubscriptions(customer.id);
    const current = pickSubscription(subscriptions);
    const updatable =
      current &&
      current.status !== "canceled" &&
      current.status !== "incomplete_expired";

    let finalSubscription: StripeSubscription;

    if (updatable) {
      const itemId = current.items?.data[0]?.id;
      if (itemId) {
        finalSubscription = await this.stripeRequest<StripeSubscription>(
          "POST",
          `/subscriptions/${current.id}`,
          {
            "items[0][id]": itemId,
            "items[0][price]": priceId,
            cancel_at_period_end: false,
            proration_behavior: "create_prorations",
          }
        );
      } else {
        finalSubscription = await this.stripeRequest<StripeSubscription>(
          "POST",
          "/subscriptions",
          {
            customer: customer.id,
            "items[0][price]": priceId,
            collection_method: "charge_automatically",
          }
        );
      }
    } else {
      finalSubscription = await this.stripeRequest<StripeSubscription>(
        "POST",
        "/subscriptions",
        {
          customer: customer.id,
          "items[0][price]": priceId,
          collection_method: "charge_automatically",
        }
      );
    }

    return toState(customer, finalSubscription);
  }

  async getSubscriptionState(
    input: SubscriptionIdentityInput
  ): Promise<SubscriptionState> {
    const customer = await this.resolveCustomer(input, false);
    if (!customer) {
      return {
        email: trimOrUndefined(input.email),
        status: "none",
        cancelAtPeriodEnd: false,
      };
    }

    const subscriptions = await this.listCustomerSubscriptions(customer.id);
    const current = pickSubscription(subscriptions);
    return toState(customer, current);
  }

  async cancelSubscription(
    input: SubscriptionIdentityInput
  ): Promise<SubscriptionState> {
    const customer = await this.resolveCustomer(input, false);
    if (!customer) {
      return {
        email: trimOrUndefined(input.email),
        status: "none",
        cancelAtPeriodEnd: false,
      };
    }

    const subscriptions = await this.listCustomerSubscriptions(customer.id);
    const current = pickSubscription(subscriptions);
    if (!current) {
      return toState(customer, undefined);
    }

    if (current.status === "canceled") {
      return toState(customer, current);
    }

    const canceled = await this.stripeRequest<StripeSubscription>(
      "POST",
      `/subscriptions/${current.id}`,
      { cancel_at_period_end: true }
    );
    return toState(customer, canceled);
  }

  async listPaidInvoices(
    input: SubscriptionIdentityInput,
    options?: { limit?: number }
  ): Promise<PaidInvoice[]> {
    const customer = await this.resolveCustomer(input, false);
    if (!customer) {
      return [];
    }

    const limit = this.clampInvoiceFetchLimit(options?.limit);

    const invoices = await this.stripeRequest<StripeListResponse<StripeInvoice>>(
      "GET",
      "/invoices",
      {
        customer: customer.id,
        status: "paid",
        limit,
      }
    );

    return invoices.data
      .map((invoice) => this.normalizePaidInvoice(invoice, customer))
      .filter((item): item is PaidInvoice => Boolean(item))
      .sort((a, b) => a.paidAt.localeCompare(b.paidAt));
  }

  async listPaidInvoicesAcrossCustomers(options?: {
    limit?: number;
    maxPages?: number;
  }): Promise<PaidInvoiceAcrossCustomersResult> {
    const limit = this.clampInvoiceFetchLimit(options?.limit);
    const maxPages =
      typeof options?.maxPages === "number" && Number.isInteger(options.maxPages)
        ? Math.min(50, Math.max(1, options.maxPages))
        : 10;

    const results: PaidInvoice[] = [];
    let startingAfter: string | undefined;
    let pageCount = 0;
    let hasMore = false;
    let reachedEnd = false;

    for (let page = 0; page < maxPages; page += 1) {
      pageCount += 1;
      const invoices = await this.stripeRequest<StripeListResponse<StripeInvoice>>(
        "GET",
        "/invoices",
        {
          status: "paid",
          limit,
          starting_after: startingAfter,
        }
      );

      results.push(
        ...invoices.data
          .map((invoice) => this.normalizePaidInvoice(invoice))
          .filter((item): item is PaidInvoice => Boolean(item))
      );

      const lastId = invoices.data[invoices.data.length - 1]?.id;
      hasMore = Boolean(invoices.has_more);
      if (!hasMore) {
        reachedEnd = true;
        break;
      }
      if (!lastId) {
        break;
      }
      startingAfter = lastId;
    }

    return {
      invoices: results
        .filter((item): item is PaidInvoice => Boolean(item))
        .sort((a, b) => a.paidAt.localeCompare(b.paidAt)),
      truncated: !reachedEnd,
      hasMore,
      pageCount,
      maxPages,
    };
  }
}
