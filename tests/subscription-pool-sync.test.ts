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
  constructor(
    private readonly customerInvoices: PaidInvoice[],
    private readonly allInvoices: PaidInvoice[] = [],
    private readonly allInvoiceMeta?: {
      truncated?: boolean;
      hasMore?: boolean;
      pageCount?: number;
      maxPages?: number;
    }
  ) {}

  async listPaidInvoices(
    _input?: unknown,
    _options?: unknown
  ): Promise<PaidInvoice[]> {
    return this.customerInvoices;
  }

  async listPaidInvoicesAcrossCustomers(
    _options?: unknown
  ): Promise<{
    invoices: PaidInvoice[];
    truncated: boolean;
    hasMore: boolean;
    pageCount: number;
    maxPages: number;
  }> {
    return {
      invoices: this.allInvoices,
      truncated: Boolean(this.allInvoiceMeta?.truncated),
      hasMore: Boolean(this.allInvoiceMeta?.hasMore),
      pageCount: this.allInvoiceMeta?.pageCount ?? 1,
      maxPages: this.allInvoiceMeta?.maxPages ?? 10,
    };
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

  it("supports all-customer sync without identity", async () => {
    const invoices: PaidInvoice[] = [
      {
        invoiceId: "in_global_1",
        customerId: "cus_a",
        customerEmail: "a@example.com",
        subscriptionId: "sub_a",
        priceId: "price_starter",
        amountPaidCents: 100,
        paidAt: "2026-03-01T00:00:00.000Z",
      },
      {
        invoiceId: "in_global_2",
        customerId: "cus_b",
        customerEmail: "b@example.com",
        subscriptionId: "sub_b",
        priceId: "price_growth",
        amountPaidCents: 300,
        paidAt: "2026-03-10T00:00:00.000Z",
      },
    ];

    const sync = new SubscriptionPoolSyncService(
      new StubSubscriptionService([], invoices),
      poolAccounting
    );

    const result = await sync.syncPaidInvoices({
      allCustomers: true,
      month: "2026-03",
      limit: 50,
      maxPages: 3,
    });

    expect(result.scope).toBe("all_customers");
    expect(result.fetchedInvoiceCount).toBe(2);
    expect(result.processedInvoiceCount).toBe(2);
    expect(result.syncedCount).toBe(2);
    expect(result.duplicateCount).toBe(0);
    expect(result.truncated).toBe(false);
    expect(result.pageCount).toBe(1);
    expect(result.maxPages).toBe(10);

    const march = await poolAccounting.getMonthlySummary("2026-03");
    expect(march.contributionCount).toBe(2);
    expect(march.totalUsdCents).toBe(400);
  });

  it("reports truncation metadata for all-customer sync", async () => {
    const invoices: PaidInvoice[] = [
      {
        invoiceId: "in_truncated",
        customerId: "cus_a",
        customerEmail: "a@example.com",
        subscriptionId: "sub_a",
        priceId: "price_starter",
        amountPaidCents: 100,
        paidAt: "2026-03-01T00:00:00.000Z",
      },
    ];

    const sync = new SubscriptionPoolSyncService(
      new StubSubscriptionService([], invoices, {
        truncated: true,
        hasMore: true,
        pageCount: 3,
        maxPages: 3,
      }),
      poolAccounting
    );

    const result = await sync.syncPaidInvoices({
      allCustomers: true,
      month: "2026-03",
      maxPages: 3,
    });

    expect(result.scope).toBe("all_customers");
    expect(result.truncated).toBe(true);
    expect(result.hasMore).toBe(true);
    expect(result.pageCount).toBe(3);
    expect(result.maxPages).toBe(3);
  });
});
