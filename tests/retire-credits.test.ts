import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseAttributedReason } from "../src/services/identity.js";

const mocks = vi.hoisted(() => ({
  isWalletConfigured: vi.fn(),
  loadConfig: vi.fn(),
  initWallet: vi.fn(),
  signAndBroadcast: vi.fn(),
  selectBestOrders: vi.fn(),
  waitForRetirement: vi.fn(),
  cryptoAuthorizePayment: vi.fn(),
  cryptoCapturePayment: vi.fn(),
  cryptoRefundPayment: vi.fn(),
  stripeAuthorizePayment: vi.fn(),
  stripeCapturePayment: vi.fn(),
  stripeRefundPayment: vi.fn(),
}));

vi.mock("../src/config.js", () => ({
  isWalletConfigured: mocks.isWalletConfigured,
  loadConfig: mocks.loadConfig,
}));

vi.mock("../src/services/wallet.js", () => ({
  initWallet: mocks.initWallet,
  signAndBroadcast: mocks.signAndBroadcast,
}));

vi.mock("../src/services/order-selector.js", () => ({
  selectBestOrders: mocks.selectBestOrders,
}));

vi.mock("../src/services/indexer.js", () => ({
  waitForRetirement: mocks.waitForRetirement,
}));

vi.mock("../src/services/payment/crypto.js", () => ({
  CryptoPaymentProvider: class {
    name = "crypto";

    authorizePayment(
      amountMicro: bigint,
      denom: string,
      metadata?: Record<string, string>
    ) {
      return mocks.cryptoAuthorizePayment(amountMicro, denom, metadata);
    }

    capturePayment(authorizationId: string) {
      return mocks.cryptoCapturePayment(authorizationId);
    }

    refundPayment(authorizationId: string) {
      return mocks.cryptoRefundPayment(authorizationId);
    }
  },
}));

vi.mock("../src/services/payment/stripe-stub.js", () => ({
  StripePaymentProvider: class {
    name = "stripe";

    authorizePayment(
      amountMicro: bigint,
      denom: string,
      metadata?: Record<string, string>
    ) {
      return mocks.stripeAuthorizePayment(amountMicro, denom, metadata);
    }

    capturePayment(authorizationId: string) {
      return mocks.stripeCapturePayment(authorizationId);
    }

    refundPayment(authorizationId: string) {
      return mocks.stripeRefundPayment(authorizationId);
    }
  },
}));

import { retireCredits } from "../src/tools/retire.js";

function responseText(result: { content: Array<{ type: "text"; text: string }> }): string {
  return result.content[0]?.text ?? "";
}

describe("retireCredits", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.loadConfig.mockReturnValue({
      indexerUrl: "https://api.regen.network/indexer/v1/graphql",
      lcdUrl: "https://lcd-regen.keplr.app",
      marketplaceUrl: "https://app.regen.network",
      rpcUrl: "http://mainnet.regen.network:26657",
      chainId: "regen-1",
      walletMnemonic: "test mnemonic",
      paymentProvider: "crypto",
      defaultJurisdiction: "US",
    });

    mocks.cryptoAuthorizePayment.mockResolvedValue({
      id: "auth-1",
      provider: "crypto",
      amountMicro: 2_000_000n,
      denom: "uregen",
      status: "authorized",
    });
    mocks.cryptoCapturePayment.mockResolvedValue({
      id: "auth-1",
      provider: "crypto",
      amountMicro: 2_000_000n,
      denom: "uregen",
      status: "captured",
    });
    mocks.cryptoRefundPayment.mockResolvedValue(undefined);
    mocks.stripeAuthorizePayment.mockResolvedValue({
      id: "stripe-auth-1",
      provider: "stripe",
      amountMicro: 2_000_000n,
      denom: "uusdc",
      status: "authorized",
    });
    mocks.stripeCapturePayment.mockResolvedValue({
      id: "stripe-auth-1",
      provider: "stripe",
      amountMicro: 2_000_000n,
      denom: "uusdc",
      status: "captured",
    });
    mocks.stripeRefundPayment.mockResolvedValue(undefined);

    mocks.selectBestOrders.mockResolvedValue({
      orders: [
        {
          sellOrderId: "123",
          batchDenom: "C01-001-2026",
          quantity: "1.000000",
          askAmount: "2000000",
          askDenom: "uregen",
          costMicro: 2_000_000n,
        },
      ],
      totalQuantity: "1.000000",
      totalCostMicro: 2_000_000n,
      paymentDenom: "uregen",
      displayDenom: "REGEN",
      exponent: 6,
      insufficientSupply: false,
    });
  });

  it("returns marketplace fallback when no wallet is configured", async () => {
    mocks.isWalletConfigured.mockReturnValue(false);

    const result = await retireCredits("C01", 2, "Alice");
    const text = responseText(result);

    expect(text).toContain("## Retire Ecocredits on Regen Network");
    expect(text).toContain("**Credit class**: C01");
    expect(text).toContain("**Quantity**: 2 credits");
    expect(text).toContain("**Beneficiary name**: Alice");
    expect(text).toContain("**[app.regen.network](https://app.regen.network/projects/1?buying_options_filters=credit_card)**");
    expect(mocks.initWallet).not.toHaveBeenCalled();
  });

  it("returns success details after an on-chain retirement", async () => {
    mocks.isWalletConfigured.mockReturnValue(true);
    mocks.initWallet.mockResolvedValue({ address: "regen1buyer" });
    mocks.signAndBroadcast.mockResolvedValue({
      code: 0,
      transactionHash: "ABC123",
      height: 12345,
      rawLog: "",
    });
    mocks.waitForRetirement.mockResolvedValue({ nodeId: "WyCert123" });

    const result = await retireCredits(
      "C01",
      1,
      "Alice",
      "US-CA",
      "Unit test retirement"
    );
    const text = responseText(result);

    expect(mocks.selectBestOrders).toHaveBeenCalledWith("carbon", 1, undefined);
    expect(mocks.cryptoAuthorizePayment).toHaveBeenCalledWith(
      2_000_000n,
      "uregen",
      { buyer: "regen1buyer", creditClass: "C01" }
    );
    expect(mocks.signAndBroadcast).toHaveBeenCalledTimes(1);
    expect(mocks.cryptoCapturePayment).toHaveBeenCalledWith("auth-1");
    expect(mocks.waitForRetirement).toHaveBeenCalledWith("ABC123");
    expect(mocks.cryptoRefundPayment).not.toHaveBeenCalled();

    expect(text).toContain("## Ecocredit Retirement Successful");
    expect(text).toContain("| Cost | 2 REGEN |");
    expect(text).toContain("| Jurisdiction | US-CA |");
    expect(text).toContain("| Reason | Unit test retirement |");
    expect(text).toContain("| Transaction Hash | `ABC123` |");
    expect(text).toContain("| Certificate ID | WyCert123 |");
    expect(text).toContain("| Beneficiary Name | Alice |");

    const messages = mocks.signAndBroadcast.mock.calls[0]?.[0];
    const retirementReason =
      messages?.[0]?.value?.orders?.[0]?.retirementReason;
    const parsedReason = parseAttributedReason(retirementReason);
    expect(parsedReason.reasonText).toBe("Unit test retirement");
    expect(parsedReason.identity).toMatchObject({
      method: "manual",
      name: "Alice",
    });
  });

  it("falls back to marketplace and refunds when tx broadcast throws", async () => {
    mocks.isWalletConfigured.mockReturnValue(true);
    mocks.initWallet.mockResolvedValue({ address: "regen1buyer" });
    mocks.signAndBroadcast.mockRejectedValue(new Error("rpc unavailable"));

    const result = await retireCredits("C01", 1, "Alice");
    const text = responseText(result);

    expect(mocks.cryptoRefundPayment).toHaveBeenCalledWith("auth-1");
    expect(mocks.cryptoCapturePayment).not.toHaveBeenCalled();
    expect(mocks.waitForRetirement).not.toHaveBeenCalled();
    expect(text).toContain("Transaction broadcast failed: rpc unavailable");
    expect(text).toContain("**[app.regen.network](https://app.regen.network/projects/1?buying_options_filters=credit_card)**");
  });

  it("falls back to marketplace and refunds when tx is rejected", async () => {
    mocks.isWalletConfigured.mockReturnValue(true);
    mocks.initWallet.mockResolvedValue({ address: "regen1buyer" });
    mocks.signAndBroadcast.mockResolvedValue({
      code: 13,
      transactionHash: "BADTX",
      height: 9999,
      rawLog: "insufficient fees",
    });

    const result = await retireCredits("C01", 1, "Alice");
    const text = responseText(result);

    expect(mocks.cryptoRefundPayment).toHaveBeenCalledWith("auth-1");
    expect(mocks.cryptoCapturePayment).not.toHaveBeenCalled();
    expect(mocks.waitForRetirement).not.toHaveBeenCalled();
    expect(text).toContain("Transaction rejected (code 13): insufficient fees");
    expect(text).toContain("## Retire Ecocredits on Regen Network");
  });

  it("embeds OAuth/email identity attribution into the on-chain reason", async () => {
    mocks.isWalletConfigured.mockReturnValue(true);
    mocks.initWallet.mockResolvedValue({ address: "regen1buyer" });
    mocks.signAndBroadcast.mockResolvedValue({
      code: 0,
      transactionHash: "ABC123",
      height: 12345,
      rawLog: "",
    });
    mocks.waitForRetirement.mockResolvedValue({ nodeId: "WyCert123" });

    const result = await retireCredits(
      "C01",
      1,
      "Alice",
      "US-CA",
      "Unit test retirement",
      "alice@example.com",
      "google",
      "google-oauth-sub-123"
    );
    const text = responseText(result);

    const messages = mocks.signAndBroadcast.mock.calls[0]?.[0];
    const retirementReason =
      messages?.[0]?.value?.orders?.[0]?.retirementReason;
    const parsedReason = parseAttributedReason(retirementReason);
    expect(parsedReason.reasonText).toBe("Unit test retirement");
    expect(parsedReason.identity).toMatchObject({
      method: "oauth",
      name: "Alice",
      email: "alice@example.com",
      provider: "google",
      subject: "google-oauth-sub-123",
    });

    expect(text).toContain("| Beneficiary Email | alice@example.com |");
    expect(text).toContain("| Auth Provider | google |");
    expect(text).toContain("| Auth Subject | google-oauth-sub-123 |");
  });

  it("returns fallback instructions when identity input is invalid", async () => {
    mocks.isWalletConfigured.mockReturnValue(true);

    const result = await retireCredits(
      "C01",
      1,
      "Alice",
      "US-CA",
      "Unit test retirement",
      "not-an-email"
    );
    const text = responseText(result);

    expect(text).toContain("Identity capture failed: Invalid beneficiary_email format");
    expect(mocks.initWallet).not.toHaveBeenCalled();
  });

  it("prefers USDC order routing when stripe provider is selected", async () => {
    mocks.isWalletConfigured.mockReturnValue(true);
    mocks.loadConfig.mockReturnValue({
      indexerUrl: "https://api.regen.network/indexer/v1/graphql",
      lcdUrl: "https://lcd-regen.keplr.app",
      marketplaceUrl: "https://app.regen.network",
      rpcUrl: "http://mainnet.regen.network:26657",
      chainId: "regen-1",
      walletMnemonic: "test mnemonic",
      paymentProvider: "stripe",
      defaultJurisdiction: "US",
    });
    mocks.selectBestOrders.mockResolvedValue({
      orders: [
        {
          sellOrderId: "123",
          batchDenom: "C01-001-2026",
          quantity: "1.000000",
          askAmount: "2000000",
          askDenom: "uusdc",
          costMicro: 2_000_000n,
        },
      ],
      totalQuantity: "1.000000",
      totalCostMicro: 2_000_000n,
      paymentDenom: "uusdc",
      displayDenom: "USDC",
      exponent: 6,
      insufficientSupply: false,
    });
    mocks.initWallet.mockResolvedValue({ address: "regen1buyer" });
    mocks.signAndBroadcast.mockResolvedValue({
      code: 0,
      transactionHash: "ABC123",
      height: 12345,
      rawLog: "",
    });
    mocks.waitForRetirement.mockResolvedValue({ nodeId: "WyCert123" });

    await retireCredits("C01", 1, "Alice");

    expect(mocks.selectBestOrders).toHaveBeenCalledWith("carbon", 1, "USDC");
    expect(mocks.stripeAuthorizePayment).toHaveBeenCalledWith(
      2_000_000n,
      "uusdc",
      { buyer: "regen1buyer", creditClass: "C01" }
    );
    expect(mocks.stripeCapturePayment).toHaveBeenCalledWith("stripe-auth-1");
  });
});
