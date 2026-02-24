import { beforeEach, describe, expect, it } from "vitest";
import { PoolAccountingService } from "../src/services/pool-accounting/service.js";
import type {
  PoolAccountingState,
  PoolAccountingStore,
} from "../src/services/pool-accounting/types.js";
import { SubscriptionPoolSyncService } from "../src/services/subscription/pool-sync.js";
import type { PaidInvoice } from "../src/services/subscription/stripe.js";

class InMemoryPoolAccountingStore implements PoolAccountingStore {
  private state: PoolAccountingState = { version: 1, contributions: [] };

  async readState(): Promise<PoolAccountingState> {
    return JSON.parse(JSON.stringify(this.state)) as PoolAccountingState;
  }

  async writeState(state: PoolAccountingState): Promise<void> {
    this.state = JSON.parse(JSON.stringify(state)) as PoolAccountingState;
  }
}

class StubSubscriptionService {
  constructor(private readonly invoices: PaidInvoice[]) {}

  async listPaidInvoices(
    _input?: unknown,
    _options?: unknown
  ): Promise<PaidInvoice[]> {
    return this.invoices;
  }
}

describe("SubscriptionPoolSyncService", () => {
  let poolAccounting: PoolAccountingService;

  beforeEach(() => {
    poolAccounting = new PoolAccountingService(new InMemoryPoolAccountingStore());
  });

  it("syncs paid invoices into pool accounting and deduplicates on rerun", async () => {
    const invoices: PaidInvoice[] = [
      {
        invoiceId: "in_march",
        customerId: "cus_123",
        customerEmail: "alice@example.com",
        subscriptionId: "sub_123",
        priceId: "price_growth",
        amountPaidCents: 300,
        paidAt: "2026-03-15T00:00:00.000Z",
      },
      {
        invoiceId: "in_april",
        customerId: "cus_123",
        customerEmail: "alice@example.com",
        subscriptionId: "sub_123",
        priceId: "price_growth",
        amountPaidCents: 300,
        paidAt: "2026-04-15T00:00:00.000Z",
      },
    ];

    const sync = new SubscriptionPoolSyncService(
      new StubSubscriptionService(invoices),
      poolAccounting
    );

    const first = await sync.syncPaidInvoices({
      customerId: "cus_123",
      month: "2026-03",
    });

    expect(first.fetchedInvoiceCount).toBe(2);
    expect(first.processedInvoiceCount).toBe(1);
    expect(first.syncedCount).toBe(1);
    expect(first.duplicateCount).toBe(0);
    expect(first.skippedCount).toBe(1);
    expect(first.records[0]).toMatchObject({
      invoiceId: "in_march",
      duplicated: false,
      amountUsdCents: 300,
    });

    const second = await sync.syncPaidInvoices({
      customerId: "cus_123",
      month: "2026-03",
    });

    expect(second.syncedCount).toBe(0);
    expect(second.duplicateCount).toBe(1);
    expect(second.records[0]).toMatchObject({
      invoiceId: "in_march",
      duplicated: true,
    });

    const march = await poolAccounting.getMonthlySummary("2026-03");
    expect(march.totalUsdCents).toBe(300);
    expect(march.contributionCount).toBe(1);
  });

  it("requires an identity and validates month format", async () => {
    const sync = new SubscriptionPoolSyncService(
      new StubSubscriptionService([]),
      poolAccounting
    );

    await expect(sync.syncPaidInvoices({})).rejects.toThrow(
      "Provide at least one of customerId or email"
    );
    await expect(
      sync.syncPaidInvoices({ customerId: "cus_123", month: "03-2026" })
    ).rejects.toThrow("month must be in YYYY-MM format");
  });
});
