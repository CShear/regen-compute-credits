import type { MonthlyContributorAggregate } from "../pool-accounting/types.js";
import type { ContributorAttribution } from "./types.js";

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

function assertSafeInteger(value: bigint, label: string): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`${label} exceeds JS safe integer range`);
  }
  return Number(value);
}

function allocateProportionally(total: bigint, weights: bigint[]): bigint[] {
  if (total <= 0n || weights.length === 0) {
    return weights.map(() => 0n);
  }

  const sumWeights = weights.reduce((acc, item) => acc + item, 0n);
  if (sumWeights <= 0n) {
    return weights.map(() => 0n);
  }

  const entries = weights.map((weight, index) => {
    const raw = total * weight;
    const base = raw / sumWeights;
    const remainder = raw % sumWeights;
    return { index, weight, base, remainder };
  });

  let allocated = entries.reduce((acc, item) => acc + item.base, 0n);
  let remainderUnits = total - allocated;

  entries.sort((a, b) => {
    if (a.remainder > b.remainder) return -1;
    if (a.remainder < b.remainder) return 1;
    if (a.weight > b.weight) return -1;
    if (a.weight < b.weight) return 1;
    return a.index - b.index;
  });

  for (let i = 0; i < entries.length && remainderUnits > 0n; i += 1) {
    entries[i].base += 1n;
    remainderUnits -= 1n;
  }

  const result = new Array<bigint>(weights.length).fill(0n);
  for (const item of entries) {
    result[item.index] = item.base;
  }

  allocated = result.reduce((acc, item) => acc + item, 0n);
  if (allocated !== total) {
    throw new Error("Proportional allocation mismatch");
  }

  return result;
}

export interface BuildAttributionsInput {
  contributors: MonthlyContributorAggregate[];
  totalContributionUsdCents: number;
  appliedBudgetUsdCents: number;
  totalCostMicro: bigint;
  retiredQuantity: string;
  paymentDenom: string;
}

export function buildContributorAttributions(
  input: BuildAttributionsInput
): ContributorAttribution[] {
  if (!input.contributors.length) return [];
  if (input.totalContributionUsdCents <= 0) return [];

  const weights = input.contributors.map((item) => BigInt(item.totalUsdCents));
  const sumWeights = weights.reduce((acc, item) => acc + item, 0n);
  if (sumWeights <= 0n) return [];

  const quantityMicroTotal = parseQuantityToMicro(input.retiredQuantity);
  const budgetAllocations = allocateProportionally(
    BigInt(input.appliedBudgetUsdCents),
    weights
  );
  const costAllocations = allocateProportionally(input.totalCostMicro, weights);
  const quantityAllocations = allocateProportionally(quantityMicroTotal, weights);

  return input.contributors.map((contributor, index) => {
    const weight = weights[index] || 0n;
    const sharePpm =
      sumWeights > 0n
        ? assertSafeInteger((weight * 1_000_000n) / sumWeights, "sharePpm")
        : 0;

    return {
      userId: contributor.userId,
      email: contributor.email,
      customerId: contributor.customerId,
      sharePpm,
      contributionUsdCents: contributor.totalUsdCents,
      attributedBudgetUsdCents: assertSafeInteger(
        budgetAllocations[index] || 0n,
        "attributedBudgetUsdCents"
      ),
      attributedCostMicro: (costAllocations[index] || 0n).toString(),
      attributedQuantity: microToQuantity(quantityAllocations[index] || 0n),
      paymentDenom: input.paymentDenom,
    };
  });
}
