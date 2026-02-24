import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AllowedDenom, CreditClass, SellOrder } from "../src/services/ledger.js";

const ledgerMocks = vi.hoisted(() => ({
  listSellOrders: vi.fn<() => Promise<SellOrder[]>>(),
  listCreditClasses: vi.fn<() => Promise<CreditClass[]>>(),
  listBatches: vi.fn(),
  getAllowedDenoms: vi.fn<() => Promise<AllowedDenom[]>>(),
}));

vi.mock("../src/services/ledger.js", () => ({
  listSellOrders: ledgerMocks.listSellOrders,
  listCreditClasses: ledgerMocks.listCreditClasses,
  listBatches: ledgerMocks.listBatches,
  getAllowedDenoms: ledgerMocks.getAllowedDenoms,
}));

import { selectBestOrders } from "../src/services/order-selector.js";

const CARBON_CLASSES: CreditClass[] = [
  {
    id: "C01",
    admin: "regen1admin",
    metadata: "",
    credit_type_abbrev: "C",
  },
];

function order(overrides: Partial<SellOrder>): SellOrder {
  return {
    id: "order-1",
    seller: "regen1seller",
    batch_denom: "C01-001-2026",
    quantity: "1",
    ask_denom: "uregen",
    ask_amount: "1000",
    disable_auto_retire: false,
    expiration: null,
    ...overrides,
  };
}

describe("selectBestOrders", () => {
  beforeEach(() => {
    ledgerMocks.listSellOrders.mockReset();
    ledgerMocks.listCreditClasses.mockReset();
    ledgerMocks.getAllowedDenoms.mockReset();
    ledgerMocks.listBatches.mockReset();
    vi.useRealTimers();

    ledgerMocks.listCreditClasses.mockResolvedValue(CARBON_CLASSES);
    ledgerMocks.getAllowedDenoms.mockResolvedValue([
      { bank_denom: "uregen", display_denom: "REGEN", exponent: 6 },
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("routes fills cheapest-first across multiple eligible orders", async () => {
    ledgerMocks.listSellOrders.mockResolvedValue([
      order({ id: "expensive", ask_amount: "2200", quantity: "2" }),
      order({ id: "cheapest", ask_amount: "1000", quantity: "1" }),
      order({ id: "mid", ask_amount: "1500", quantity: "3" }),
    ]);

    const selection = await selectBestOrders("carbon", 3.5);

    expect(selection.orders.map((o) => o.sellOrderId)).toEqual(["cheapest", "mid"]);
    expect(selection.orders.map((o) => o.quantity)).toEqual(["1.000000", "2.500000"]);
    expect(selection.totalCostMicro).toBe(4750n);
    expect(selection.totalQuantity).toBe("3.500000");
    expect(selection.insufficientSupply).toBe(false);
  });

  it("filters out expired orders", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T00:00:00.000Z"));

    ledgerMocks.listSellOrders.mockResolvedValue([
      order({
        id: "expired-cheap",
        ask_amount: "500",
        expiration: "2026-05-31T23:59:59.000Z",
      }),
      order({
        id: "open-order",
        ask_amount: "900",
        expiration: null,
      }),
      order({
        id: "future-order",
        ask_amount: "1200",
        expiration: "2026-12-31T00:00:00.000Z",
      }),
    ]);

    const selection = await selectBestOrders("carbon", 1);

    expect(selection.orders).toHaveLength(1);
    expect(selection.orders[0]?.sellOrderId).toBe("open-order");
    expect(selection.totalCostMicro).toBe(900n);
  });

  it("honors preferred payment denom when provided", async () => {
    ledgerMocks.getAllowedDenoms.mockResolvedValue([
      { bank_denom: "uregen", display_denom: "REGEN", exponent: 6 },
      { bank_denom: "uusdc", display_denom: "USDC", exponent: 6 },
    ]);
    ledgerMocks.listSellOrders.mockResolvedValue([
      order({ id: "regen-cheap", ask_denom: "uregen", ask_amount: "1000" }),
      order({ id: "usdc-order", ask_denom: "uusdc", ask_amount: "1300" }),
    ]);

    const selection = await selectBestOrders("carbon", 1, "USDC");

    expect(selection.paymentDenom).toBe("uusdc");
    expect(selection.displayDenom).toBe("USDC");
    expect(selection.orders).toHaveLength(1);
    expect(selection.orders[0]?.sellOrderId).toBe("usdc-order");
    expect(selection.orders[0]?.askDenom).toBe("uusdc");
  });

  it("flags insufficient supply when eligible order quantity is too low", async () => {
    ledgerMocks.listSellOrders.mockResolvedValue([
      order({ id: "small-1", quantity: "1", ask_amount: "1000" }),
      order({ id: "small-2", quantity: "2", ask_amount: "1100" }),
    ]);

    const selection = await selectBestOrders("carbon", 5);

    expect(selection.insufficientSupply).toBe(true);
    expect(selection.totalQuantity).toBe("3.000000");
    expect(selection.orders.map((o) => o.sellOrderId)).toEqual(["small-1", "small-2"]);
    expect(selection.totalCostMicro).toBe(3200n);
  });
});
