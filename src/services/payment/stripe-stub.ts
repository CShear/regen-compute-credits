/**
 * Stripe payment provider implementation.
 *
 * Uses PaymentIntents with manual capture:
 * - authorizePayment: create + confirm an intent with capture_method=manual
 * - capturePayment: capture the previously authorized intent
 * - refundPayment: cancel the intent to release the authorization hold
 */

import type {
  PaymentProvider,
  PaymentAuthorization,
  PaymentReceipt,
} from "./types.js";

const STRIPE_API_BASE = "https://api.stripe.com/v1";

interface StripeIntent {
  id: string;
  status: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, string>;
  last_payment_error?: { message?: string };
}

interface StripeErrorResponse {
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

interface StripeChargeSpec {
  amountMinor: number;
  currency: string;
}

function ceilDiv(dividend: bigint, divisor: bigint): bigint {
  return (dividend + divisor - 1n) / divisor;
}

function assertSafeNumber(value: bigint, label: string): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`${label} is too large for Stripe API numeric limits`);
  }
  return Number(value);
}

function toStripeCharge(amountMicro: bigint, denom: string): StripeChargeSpec {
  if (amountMicro <= 0n) {
    throw new Error("Payment amount must be greater than zero");
  }

  const normalized = denom.toLowerCase();

  // 1 USDC = 1 USD; on-chain uses micro-units (1e-6).
  // Stripe USD amounts are in cents (1e-2).
  if (normalized === "uusdc") {
    const amountCents = ceilDiv(amountMicro, 10_000n);
    return {
      amountMinor: assertSafeNumber(amountCents, "Stripe amount"),
      currency: "usd",
    };
  }

  throw new Error(
    `Stripe supports only uusdc-denominated retirements; received ${denom}`
  );
}

function fromStripeCharge(amountMinor: number, currency: string): {
  amountMicro: bigint;
  denom: string;
} {
  if (currency.toLowerCase() === "usd") {
    // cents to micro-USDC
    return {
      amountMicro: BigInt(amountMinor) * 10_000n,
      denom: "uusdc",
    };
  }

  return { amountMicro: 0n, denom: "" };
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

export class StripePaymentProvider implements PaymentProvider {
  name = "stripe";

  private getSecretKey(): string | undefined {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    return key && key.length > 0 ? key : undefined;
  }

  private getPaymentMethodId(metadata?: Record<string, string>): string | undefined {
    const fromMetadata = metadata?.stripe_payment_method_id?.trim();
    if (fromMetadata) return fromMetadata;
    const fromEnv = process.env.STRIPE_PAYMENT_METHOD_ID?.trim();
    return fromEnv && fromEnv.length > 0 ? fromEnv : undefined;
  }

  private getCustomerId(metadata?: Record<string, string>): string | undefined {
    const fromMetadata = metadata?.stripe_customer_id?.trim();
    if (fromMetadata) return fromMetadata;
    const fromEnv = process.env.STRIPE_CUSTOMER_ID?.trim();
    return fromEnv && fromEnv.length > 0 ? fromEnv : undefined;
  }

  private async stripePost(
    path: string,
    fields: Record<string, string | number | boolean | undefined>
  ): Promise<StripeIntent> {
    const secretKey = this.getSecretKey();
    if (!secretKey) {
      throw new Error("Stripe is not configured: missing STRIPE_SECRET_KEY");
    }

    const response = await fetch(`${STRIPE_API_BASE}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: encodeForm(fields),
    });

    const payload = (await response.json()) as StripeIntent | StripeErrorResponse;

    if (!response.ok) {
      const err = (payload as StripeErrorResponse).error;
      const code = err?.code ? ` (${err.code})` : "";
      throw new Error(err?.message ? `${err.message}${code}` : "Stripe API error");
    }

    return payload as StripeIntent;
  }

  async authorizePayment(
    amountMicro: bigint,
    denom: string,
    metadata?: Record<string, string>
  ): Promise<PaymentAuthorization> {
    const secretKey = this.getSecretKey();
    if (!secretKey) {
      return {
        id: `stripe-misconfigured-${Date.now()}`,
        provider: this.name,
        amountMicro,
        denom,
        status: "failed",
        message: "Stripe is not configured: missing STRIPE_SECRET_KEY",
      };
    }

    let charge: StripeChargeSpec;
    try {
      charge = toStripeCharge(amountMicro, denom);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        id: `stripe-unsupported-${Date.now()}`,
        provider: this.name,
        amountMicro,
        denom,
        status: "failed",
        message: errMsg,
      };
    }

    const paymentMethodId = this.getPaymentMethodId(metadata);
    if (!paymentMethodId) {
      return {
        id: `stripe-missing-payment-method-${Date.now()}`,
        provider: this.name,
        amountMicro,
        denom,
        status: "failed",
        message:
          "Stripe payment method is not configured. Set STRIPE_PAYMENT_METHOD_ID " +
          "or provide metadata.stripe_payment_method_id.",
      };
    }

    try {
      const intent = await this.stripePost("/payment_intents", {
        amount: charge.amountMinor,
        currency: charge.currency,
        capture_method: "manual",
        confirm: true,
        payment_method: paymentMethodId,
        customer: this.getCustomerId(metadata),
        off_session: true,
        description: "Regen Compute Credits retirement authorization",
        "metadata[integration]": "regen-compute-credits",
        "metadata[regen_amount_micro]": amountMicro.toString(),
        "metadata[regen_denom]": denom,
        "metadata[buyer]": metadata?.buyer,
        "metadata[credit_class]": metadata?.creditClass,
      });

      if (intent.status !== "requires_capture" && intent.status !== "succeeded") {
        return {
          id: intent.id,
          provider: this.name,
          amountMicro,
          denom,
          status: "failed",
          message:
            intent.last_payment_error?.message ||
            `Stripe authorization failed with status ${intent.status}`,
        };
      }

      return {
        id: intent.id,
        provider: this.name,
        amountMicro,
        denom,
        status: "authorized",
      };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        id: `stripe-error-${Date.now()}`,
        provider: this.name,
        amountMicro,
        denom,
        status: "failed",
        message: `Stripe authorization failed: ${errMsg}`,
      };
    }
  }

  async capturePayment(authorizationId: string): Promise<PaymentReceipt> {
    const intent = await this.stripePost(
      `/payment_intents/${authorizationId}/capture`,
      {}
    );

    const amountFromMetadata = intent.metadata?.regen_amount_micro;
    const denomFromMetadata = intent.metadata?.regen_denom;

    if (amountFromMetadata && denomFromMetadata) {
      return {
        id: intent.id,
        provider: this.name,
        amountMicro: BigInt(amountFromMetadata),
        denom: denomFromMetadata,
        status: "captured",
      };
    }

    const fallback = fromStripeCharge(intent.amount || 0, intent.currency || "");
    return {
      id: intent.id,
      provider: this.name,
      amountMicro: fallback.amountMicro,
      denom: fallback.denom,
      status: "captured",
    };
  }

  async refundPayment(authorizationId: string): Promise<void> {
    try {
      await this.stripePost(`/payment_intents/${authorizationId}/cancel`, {});
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes("already canceled")) {
        return;
      }
      throw err;
    }
  }
}
