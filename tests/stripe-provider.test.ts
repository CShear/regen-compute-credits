import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StripePaymentProvider } from "../src/services/payment/stripe-stub.js";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("StripePaymentProvider", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.STRIPE_PAYMENT_METHOD_ID = "pm_test_123";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("authorizes payment intents with manual capture", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        id: "pi_123",
        status: "requires_capture",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const provider = new StripePaymentProvider();
    const auth = await provider.authorizePayment(2_000_000n, "uusdc", {
      buyer: "regen1buyer",
      creditClass: "C01",
    });

    expect(auth).toEqual({
      id: "pi_123",
      provider: "stripe",
      amountMicro: 2_000_000n,
      denom: "uusdc",
      status: "authorized",
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.stripe.com/v1/payment_intents");
    expect(init.method).toBe("POST");
    expect(String(init.body)).toContain("amount=200");
    expect(String(init.body)).toContain("capture_method=manual");
    expect(String(init.body)).toContain("payment_method=pm_test_123");
  });

  it("fails authorization when denom is unsupported", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const provider = new StripePaymentProvider();
    const auth = await provider.authorizePayment(2_000_000n, "uregen");

    expect(auth.status).toBe("failed");
    expect(auth.message).toContain("supports only uusdc");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("captures payment intents and returns receipt values from metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(200, {
          id: "pi_123",
          status: "succeeded",
          metadata: {
            regen_amount_micro: "2500000",
            regen_denom: "uusdc",
          },
        })
      )
    );

    const provider = new StripePaymentProvider();
    const receipt = await provider.capturePayment("pi_123");

    expect(receipt).toEqual({
      id: "pi_123",
      provider: "stripe",
      amountMicro: 2_500_000n,
      denom: "uusdc",
      status: "captured",
    });
  });

  it("cancels authorization holds on refundPayment", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        id: "pi_123",
        status: "canceled",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const provider = new StripePaymentProvider();
    await provider.refundPayment("pi_123");

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.stripe.com/v1/payment_intents/pi_123/cancel");
  });
});
