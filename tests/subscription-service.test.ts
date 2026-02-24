import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StripeSubscriptionService } from "../src/services/subscription/stripe.js";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("StripeSubscriptionService", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.STRIPE_PAYMENT_METHOD_ID = "pm_env_default";
    process.env.STRIPE_PRICE_ID_STARTER = "price_starter";
    process.env.STRIPE_PRICE_ID_GROWTH = "price_growth";
    process.env.STRIPE_PRICE_ID_IMPACT = "price_impact";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("creates a customer subscription for the selected tier", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { data: [] }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          id: "cus_123",
          email: "alice@example.com",
          name: "Alice",
        })
      )
      .mockResolvedValueOnce(jsonResponse(200, { id: "pm_123" }))
      .mockResolvedValueOnce(
        jsonResponse(200, { id: "cus_123", email: "alice@example.com" })
      )
      .mockResolvedValueOnce(jsonResponse(200, { data: [] }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          id: "sub_123",
          status: "active",
          customer: "cus_123",
          cancel_at_period_end: false,
          current_period_end: 1767225600,
          items: {
            data: [
              {
                id: "si_123",
                price: { id: "price_growth" },
              },
            ],
          },
        })
      );
    vi.stubGlobal("fetch", fetchMock);

    const service = new StripeSubscriptionService();
    const state = await service.ensureSubscription("growth", {
      email: "alice@example.com",
      fullName: "Alice",
      paymentMethodId: "pm_123",
    });

    expect(state).toMatchObject({
      customerId: "cus_123",
      email: "alice@example.com",
      subscriptionId: "sub_123",
      status: "active",
      tierId: "growth",
      priceId: "price_growth",
      cancelAtPeriodEnd: false,
    });
    expect(fetchMock).toHaveBeenCalledTimes(6);

    const [searchUrl] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(searchUrl).toContain("/customers?email=alice%40example.com&limit=1");

    const [, createSubscriptionInit] = fetchMock.mock.calls[5] as [
      string,
      RequestInit,
    ];
    expect(String(createSubscriptionInit.body)).toContain("price_growth");
  });

  it("returns status=none when no customer exists for the lookup email", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, { data: [] })));

    const service = new StripeSubscriptionService();
    const state = await service.getSubscriptionState({
      email: "missing@example.com",
    });

    expect(state).toEqual({
      email: "missing@example.com",
      status: "none",
      cancelAtPeriodEnd: false,
    });
  });

  it("cancels active subscriptions at period end", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: "cus_123", email: "alice@example.com" }],
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [
            {
              id: "sub_123",
              status: "active",
              customer: "cus_123",
              cancel_at_period_end: false,
              current_period_end: 1767225600,
              items: { data: [{ id: "si_123", price: { id: "price_starter" } }] },
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          id: "sub_123",
          status: "active",
          customer: "cus_123",
          cancel_at_period_end: true,
          current_period_end: 1767225600,
          items: { data: [{ id: "si_123", price: { id: "price_starter" } }] },
        })
      );
    vi.stubGlobal("fetch", fetchMock);

    const service = new StripeSubscriptionService();
    const state = await service.cancelSubscription({ email: "alice@example.com" });

    expect(state).toMatchObject({
      customerId: "cus_123",
      status: "active",
      tierId: "starter",
      cancelAtPeriodEnd: true,
    });

    const [cancelUrl, cancelInit] = fetchMock.mock.calls[2] as [string, RequestInit];
    expect(cancelUrl).toContain("/subscriptions/sub_123");
    expect(String(cancelInit.body)).toContain("cancel_at_period_end=true");
  });

  it("lists paid usd invoices normalized for pool sync", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [{ id: "cus_123", email: "alice@example.com" }],
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: [
            {
              id: "in_2",
              customer: "cus_123",
              customer_email: "alice@example.com",
              subscription: "sub_123",
              amount_paid: 500,
              currency: "usd",
              status_transitions: { paid_at: 1_707_000_100 },
              lines: { data: [{ id: "il_2", price: { id: "price_growth" } }] },
            },
            {
              id: "in_skip_currency",
              customer: "cus_123",
              amount_paid: 500,
              currency: "eur",
              status_transitions: { paid_at: 1_707_000_200 },
              lines: { data: [{ id: "il_3", price: { id: "price_growth" } }] },
            },
            {
              id: "in_1",
              customer: "cus_123",
              customer_email: "alice@example.com",
              subscription: "sub_123",
              amount_paid: 100,
              currency: "usd",
              status_transitions: { paid_at: 1_707_000_000 },
              lines: { data: [{ id: "il_1", price: { id: "price_starter" } }] },
            },
          ],
        })
      );
    vi.stubGlobal("fetch", fetchMock);

    const service = new StripeSubscriptionService();
    const invoices = await service.listPaidInvoices(
      { email: "alice@example.com" },
      { limit: 5 }
    );

    expect(invoices).toHaveLength(2);
    expect(invoices[0]).toMatchObject({
      invoiceId: "in_1",
      customerId: "cus_123",
      customerEmail: "alice@example.com",
      subscriptionId: "sub_123",
      amountPaidCents: 100,
      priceId: "price_starter",
    });
    expect(invoices[1]).toMatchObject({
      invoiceId: "in_2",
      amountPaidCents: 500,
      priceId: "price_growth",
    });

    const [invoicesUrl] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(invoicesUrl).toContain(
      "/invoices?customer=cus_123&status=paid&limit=5"
    );
  });

  it("lists paid invoices across all customers with pagination", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, {
          has_more: true,
          data: [
            {
              id: "in_3",
              customer: "cus_999",
              customer_email: "c@example.com",
              subscription: "sub_999",
              amount_paid: 500,
              currency: "usd",
              status_transitions: { paid_at: 1_707_000_200 },
              lines: { data: [{ id: "il_3", price: { id: "price_growth" } }] },
            },
            {
              id: "in_2",
              customer: "cus_123",
              customer_email: "b@example.com",
              subscription: "sub_123",
              amount_paid: 100,
              currency: "usd",
              status_transitions: { paid_at: 1_707_000_100 },
              lines: { data: [{ id: "il_2", price: { id: "price_starter" } }] },
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          has_more: false,
          data: [
            {
              id: "in_1",
              customer: "cus_321",
              customer_email: "a@example.com",
              subscription: "sub_321",
              amount_paid: 300,
              currency: "usd",
              status_transitions: { paid_at: 1_707_000_000 },
              lines: { data: [{ id: "il_1", price: { id: "price_impact" } }] },
            },
          ],
        })
      );
    vi.stubGlobal("fetch", fetchMock);

    const service = new StripeSubscriptionService();
    const invoices = await service.listPaidInvoicesAcrossCustomers({
      limit: 2,
      maxPages: 5,
    });

    expect(invoices).toHaveLength(3);
    expect(invoices[0]).toMatchObject({
      invoiceId: "in_1",
      customerId: "cus_321",
      amountPaidCents: 300,
    });
    expect(invoices[2]).toMatchObject({
      invoiceId: "in_3",
      customerId: "cus_999",
      amountPaidCents: 500,
    });

    const [firstUrl] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(firstUrl).toContain("/invoices?status=paid&limit=2");
    const [secondUrl] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(secondUrl).toContain(
      "/invoices?status=paid&limit=2&starting_after=in_2"
    );
  });
});
