import { describe, expect, it } from "vitest";
import { buildContributorAttributions } from "../src/services/batch-retirement/attribution.js";

describe("buildContributorAttributions", () => {
  it("allocates budget, spend, and quantity proportionally while preserving totals", () => {
    const attributions = buildContributorAttributions({
      contributors: [
        {
          userId: "user-a",
          contributionCount: 1,
          totalUsdCents: 100,
          totalUsd: 1,
        },
        {
          userId: "user-b",
          contributionCount: 1,
          totalUsdCents: 300,
          totalUsd: 3,
        },
      ],
      totalContributionUsdCents: 400,
      appliedBudgetUsdCents: 400,
      totalCostMicro: 4_000_000n,
      retiredQuantity: "2.000000",
      paymentDenom: "uusdc",
    });

    expect(attributions).toHaveLength(2);
    expect(attributions[0]).toMatchObject({
      userId: "user-a",
      sharePpm: 250000,
      attributedBudgetUsdCents: 100,
      attributedCostMicro: "1000000",
      attributedQuantity: "0.500000",
    });
    expect(attributions[1]).toMatchObject({
      userId: "user-b",
      sharePpm: 750000,
      attributedBudgetUsdCents: 300,
      attributedCostMicro: "3000000",
      attributedQuantity: "1.500000",
    });

    const totalBudget = attributions.reduce(
      (sum, item) => sum + item.attributedBudgetUsdCents,
      0
    );
    const totalCostMicro = attributions.reduce(
      (sum, item) => sum + BigInt(item.attributedCostMicro),
      0n
    );
    expect(totalBudget).toBe(400);
    expect(totalCostMicro).toBe(4_000_000n);
  });

  it("handles rounding by distributing remainder deterministically", () => {
    const attributions = buildContributorAttributions({
      contributors: [
        {
          userId: "u1",
          contributionCount: 1,
          totalUsdCents: 1,
          totalUsd: 0.01,
        },
        {
          userId: "u2",
          contributionCount: 1,
          totalUsdCents: 1,
          totalUsd: 0.01,
        },
        {
          userId: "u3",
          contributionCount: 1,
          totalUsdCents: 1,
          totalUsd: 0.01,
        },
      ],
      totalContributionUsdCents: 3,
      appliedBudgetUsdCents: 2,
      totalCostMicro: 2n,
      retiredQuantity: "0.000002",
      paymentDenom: "uusdc",
    });

    const totalBudget = attributions.reduce(
      (sum, item) => sum + item.attributedBudgetUsdCents,
      0
    );
    const totalCostMicro = attributions.reduce(
      (sum, item) => sum + BigInt(item.attributedCostMicro),
      0n
    );
    const totalQuantityMicro = attributions.reduce((sum, item) => {
      const [whole, frac = ""] = item.attributedQuantity.split(".");
      return sum + BigInt(whole) * 1_000_000n + BigInt(frac.padEnd(6, "0"));
    }, 0n);

    expect(totalBudget).toBe(2);
    expect(totalCostMicro).toBe(2n);
    expect(totalQuantityMicro).toBe(2n);
  });
});
