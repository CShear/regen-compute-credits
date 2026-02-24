import { describe, expect, it } from "vitest";
import { AttributionDashboardService } from "../src/services/attribution/dashboard.js";
import type { BatchExecutionState, BatchExecutionStore } from "../src/services/batch-retirement/types.js";
import type { UserContributionSummary } from "../src/services/pool-accounting/types.js";

class InMemoryBatchExecutionStore implements BatchExecutionStore {
  constructor(private readonly state: BatchExecutionState) {}

  async readState(): Promise<BatchExecutionState> {
    return JSON.parse(JSON.stringify(this.state)) as BatchExecutionState;
  }

  async writeState(state: BatchExecutionState): Promise<void> {
    this.state = JSON.parse(JSON.stringify(state)) as BatchExecutionState;
  }
}

describe("AttributionDashboardService", () => {
  it("builds subscriber dashboard totals from contribution + attribution history", async () => {
    const userSummary: UserContributionSummary = {
      userId: "email:alice@example.com",
      email: "alice@example.com",
      customerId: "cus_123",
      contributionCount: 2,
      totalUsdCents: 400,
      totalUsd: 4,
      lastContributionAt: "2026-03-15T00:00:00.000Z",
      byMonth: [
        {
          month: "2026-02",
          contributionCount: 1,
          totalUsdCents: 100,
          totalUsd: 1,
        },
        {
          month: "2026-03",
          contributionCount: 1,
          totalUsdCents: 300,
          totalUsd: 3,
        },
      ],
    };

    const service = new AttributionDashboardService({
      poolAccounting: {
        getUserSummary: async () => userSummary,
      },
      executionStore: new InMemoryBatchExecutionStore({
        version: 1,
        executions: [
          {
            id: "batch_1",
            month: "2026-03",
            creditType: "carbon",
            dryRun: false,
            status: "success",
            reason: "Monthly pool retirement",
            budgetUsdCents: 300,
            spentMicro: "3000000",
            spentDenom: "uusdc",
            retiredQuantity: "1.500000",
            attributions: [
              {
                userId: "email:alice@example.com",
                email: "alice@example.com",
                customerId: "cus_123",
                sharePpm: 500000,
                contributionUsdCents: 300,
                attributedBudgetUsdCents: 150,
                attributedCostMicro: "1500000",
                attributedQuantity: "0.750000",
                paymentDenom: "uusdc",
              },
            ],
            txHash: "TX123",
            blockHeight: 123,
            retirementId: "WyRet1",
            executedAt: "2026-03-31T00:00:00.000Z",
          },
          {
            id: "batch_2",
            month: "2026-02",
            creditType: "biodiversity",
            dryRun: false,
            status: "success",
            reason: "Monthly pool retirement",
            budgetUsdCents: 100,
            spentMicro: "1000000",
            spentDenom: "uusdc",
            retiredQuantity: "0.500000",
            attributions: [
              {
                userId: "email:alice@example.com",
                email: "alice@example.com",
                customerId: "cus_123",
                sharePpm: 1000000,
                contributionUsdCents: 100,
                attributedBudgetUsdCents: 100,
                attributedCostMicro: "1000000",
                attributedQuantity: "0.500000",
                paymentDenom: "uusdc",
              },
            ],
            txHash: "TX122",
            blockHeight: 122,
            retirementId: "WyRet2",
            executedAt: "2026-02-28T00:00:00.000Z",
          },
        ],
      }),
    });

    const dashboard = await service.getSubscriberDashboard({
      email: "alice@example.com",
    });

    expect(dashboard).toMatchObject({
      userId: "email:alice@example.com",
      contributionCount: 2,
      totalContributedUsdCents: 400,
      totalAttributedBudgetUsdCents: 250,
      totalAttributedQuantity: "1.250000",
      attributionCount: 2,
    });
    expect(dashboard?.byMonth[0]).toMatchObject({
      month: "2026-03",
      contributionUsdCents: 300,
      attributedBudgetUsdCents: 150,
      attributedQuantity: "0.750000",
    });
  });

  it("returns a month-specific subscriber attribution certificate", async () => {
    const service = new AttributionDashboardService({
      poolAccounting: {
        getUserSummary: async () =>
          ({
            userId: "user-1",
            email: "user@example.com",
            contributionCount: 1,
            totalUsdCents: 300,
            totalUsd: 3,
            byMonth: [
              {
                month: "2026-03",
                contributionCount: 1,
                totalUsdCents: 300,
                totalUsd: 3,
              },
            ],
          } as UserContributionSummary),
      },
      executionStore: new InMemoryBatchExecutionStore({
        version: 1,
        executions: [
          {
            id: "batch_1",
            month: "2026-03",
            dryRun: false,
            status: "success",
            reason: "Monthly pool retirement",
            budgetUsdCents: 300,
            spentMicro: "3000000",
            spentDenom: "uusdc",
            retiredQuantity: "1.500000",
            attributions: [
              {
                userId: "user-1",
                sharePpm: 400000,
                contributionUsdCents: 300,
                attributedBudgetUsdCents: 120,
                attributedCostMicro: "1200000",
                attributedQuantity: "0.600000",
                paymentDenom: "uusdc",
              },
            ],
            txHash: "TX123",
            blockHeight: 123,
            retirementId: "WyRet1",
            executedAt: "2026-03-31T00:00:00.000Z",
          },
        ],
      }),
    });

    const certificate = await service.getSubscriberCertificateForMonth({
      month: "2026-03",
      userId: "user-1",
    });

    expect(certificate).toMatchObject({
      userId: "user-1",
      month: "2026-03",
      contributionUsdCents: 300,
    });
    expect(certificate?.execution).toMatchObject({
      executionId: "batch_1",
      attributedBudgetUsdCents: 120,
      attributedQuantity: "0.600000",
      txHash: "TX123",
    });
  });
});
