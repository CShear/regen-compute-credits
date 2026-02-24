import { PoolAccountingService } from "../pool-accounting/service.js";
import { JsonFileBatchExecutionStore } from "../batch-retirement/store.js";
import type {
  BatchExecutionRecord,
  BatchExecutionStore,
  ContributorAttribution,
} from "../batch-retirement/types.js";

const MICRO_FACTOR = 1_000_000n;

function parseQuantityToMicro(quantity: string): bigint {
  const [wholePart, fracPart = ""] = quantity.split(".");
  const whole = BigInt(wholePart || "0");
  const fracPadded = fracPart.padEnd(6, "0").slice(0, 6);
  const frac = BigInt(fracPadded || "0");
  return whole * MICRO_FACTOR + frac;
}

function microToQuantity(micro: bigint): string {
  const whole = micro / MICRO_FACTOR;
  const frac = (micro % MICRO_FACTOR).toString().padStart(6, "0");
  return `${whole.toString()}.${frac}`;
}

function normalize(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeEmail(email?: string): string | undefined {
  const value = normalize(email);
  return value ? value.toLowerCase() : undefined;
}

function findAttribution(
  execution: BatchExecutionRecord,
  userId: string
): ContributorAttribution | undefined {
  return execution.attributions?.find((item) => item.userId === userId);
}

export interface SubscriberAttributionEntry {
  month: string;
  executionId: string;
  executionStatus: BatchExecutionRecord["status"];
  executedAt: string;
  reason: string;
  creditType?: "carbon" | "biodiversity";
  retirementId?: string;
  txHash?: string;
  sharePpm: number;
  attributedBudgetUsdCents: number;
  attributedCostMicro: string;
  paymentDenom: string;
  attributedQuantity: string;
}

export interface SubscriberImpactDashboard {
  userId: string;
  email?: string;
  customerId?: string;
  contributionCount: number;
  totalContributedUsdCents: number;
  totalContributedUsd: number;
  totalAttributedBudgetUsdCents: number;
  totalAttributedBudgetUsd: number;
  totalAttributedQuantity: string;
  attributionCount: number;
  byMonth: Array<{
    month: string;
    contributionUsdCents: number;
    contributionUsd: number;
    attributedBudgetUsdCents: number;
    attributedBudgetUsd: number;
    attributedQuantity: string;
  }>;
  attributions: SubscriberAttributionEntry[];
}

export interface SubscriberAttributionCertificate {
  userId: string;
  email?: string;
  customerId?: string;
  month: string;
  contributionUsdCents: number;
  contributionUsd: number;
  execution: SubscriberAttributionEntry;
}

export interface AttributionDashboardDeps {
  poolAccounting: Pick<PoolAccountingService, "getUserSummary">;
  executionStore: BatchExecutionStore;
}

export class AttributionDashboardService {
  private readonly deps: AttributionDashboardDeps;

  constructor(deps?: Partial<AttributionDashboardDeps>) {
    this.deps = {
      poolAccounting: deps?.poolAccounting || new PoolAccountingService(),
      executionStore: deps?.executionStore || new JsonFileBatchExecutionStore(),
    };
  }

  async getSubscriberDashboard(identifier: {
    userId?: string;
    email?: string;
    customerId?: string;
  }): Promise<SubscriberImpactDashboard | null> {
    const summary = await this.deps.poolAccounting.getUserSummary({
      userId: normalize(identifier.userId),
      email: normalizeEmail(identifier.email),
      customerId: normalize(identifier.customerId),
    });
    if (!summary) return null;

    const state = await this.deps.executionStore.readState();
    const attributions = state.executions
      .filter((execution) => execution.status === "success")
      .flatMap((execution) => {
        const attribution = findAttribution(execution, summary.userId);
        if (!attribution) return [];

        const entry: SubscriberAttributionEntry = {
          month: execution.month,
          executionId: execution.id,
          executionStatus: execution.status,
          executedAt: execution.executedAt,
          reason: execution.reason,
          sharePpm: attribution.sharePpm,
          attributedBudgetUsdCents: attribution.attributedBudgetUsdCents,
          attributedCostMicro: attribution.attributedCostMicro,
          paymentDenom: attribution.paymentDenom,
          attributedQuantity: attribution.attributedQuantity,
        };

        if (execution.creditType) entry.creditType = execution.creditType;
        if (execution.retirementId) entry.retirementId = execution.retirementId;
        if (execution.txHash) entry.txHash = execution.txHash;

        return [entry];
      })
      .sort((a, b) => b.month.localeCompare(a.month));

    const totalAttributedBudgetUsdCents = attributions.reduce(
      (sum, item) => sum + item.attributedBudgetUsdCents,
      0
    );
    const totalAttributedQuantityMicro = attributions.reduce(
      (sum, item) => sum + parseQuantityToMicro(item.attributedQuantity),
      0n
    );

    const byMonthMap = new Map<
      string,
      {
        month: string;
        contributionUsdCents: number;
        attributedBudgetUsdCents: number;
        attributedQuantityMicro: bigint;
      }
    >();

    for (const monthContribution of summary.byMonth) {
      byMonthMap.set(monthContribution.month, {
        month: monthContribution.month,
        contributionUsdCents: monthContribution.totalUsdCents,
        attributedBudgetUsdCents: 0,
        attributedQuantityMicro: 0n,
      });
    }

    for (const entry of attributions) {
      const existing = byMonthMap.get(entry.month) || {
        month: entry.month,
        contributionUsdCents: 0,
        attributedBudgetUsdCents: 0,
        attributedQuantityMicro: 0n,
      };
      existing.attributedBudgetUsdCents += entry.attributedBudgetUsdCents;
      existing.attributedQuantityMicro += parseQuantityToMicro(
        entry.attributedQuantity
      );
      byMonthMap.set(entry.month, existing);
    }

    const byMonth = [...byMonthMap.values()]
      .sort((a, b) => b.month.localeCompare(a.month))
      .map((month) => ({
        month: month.month,
        contributionUsdCents: month.contributionUsdCents,
        contributionUsd: month.contributionUsdCents / 100,
        attributedBudgetUsdCents: month.attributedBudgetUsdCents,
        attributedBudgetUsd: month.attributedBudgetUsdCents / 100,
        attributedQuantity: microToQuantity(month.attributedQuantityMicro),
      }));

    return {
      userId: summary.userId,
      email: summary.email,
      customerId: summary.customerId,
      contributionCount: summary.contributionCount,
      totalContributedUsdCents: summary.totalUsdCents,
      totalContributedUsd: summary.totalUsd,
      totalAttributedBudgetUsdCents,
      totalAttributedBudgetUsd: totalAttributedBudgetUsdCents / 100,
      totalAttributedQuantity: microToQuantity(totalAttributedQuantityMicro),
      attributionCount: attributions.length,
      byMonth,
      attributions,
    };
  }

  async getSubscriberCertificateForMonth(input: {
    month: string;
    userId?: string;
    email?: string;
    customerId?: string;
  }): Promise<SubscriberAttributionCertificate | null> {
    const dashboard = await this.getSubscriberDashboard(input);
    if (!dashboard) return null;

    const execution = dashboard.attributions.find(
      (item) => item.month === input.month
    );
    if (!execution) return null;

    const monthContribution = dashboard.byMonth.find(
      (item) => item.month === input.month
    );

    return {
      userId: dashboard.userId,
      email: dashboard.email,
      customerId: dashboard.customerId,
      month: input.month,
      contributionUsdCents: monthContribution?.contributionUsdCents || 0,
      contributionUsd: (monthContribution?.contributionUsdCents || 0) / 100,
      execution,
    };
  }
}
