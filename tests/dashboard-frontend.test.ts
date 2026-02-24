import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { DashboardFrontendService } from "../src/services/dashboard-frontend/service.js";

describe("DashboardFrontendService", () => {
  it("publishes a subscriber dashboard page with subscription status", async () => {
    const outputDir = await mkdtemp(path.join(tmpdir(), "regen-dash-"));
    const getSubscriberDashboard = vi.fn().mockResolvedValue({
      userId: "user-123",
      email: "user@example.com",
      customerId: "cus_123",
      contributionCount: 4,
      totalContributedUsdCents: 1200,
      totalContributedUsd: 12,
      totalAttributedBudgetUsdCents: 980,
      totalAttributedBudgetUsd: 9.8,
      totalAttributedQuantity: "4.200000",
      attributionCount: 2,
      byMonth: [
        {
          month: "2026-03",
          contributionUsdCents: 600,
          contributionUsd: 6,
          attributedBudgetUsdCents: 490,
          attributedBudgetUsd: 4.9,
          attributedQuantity: "2.100000",
        },
      ],
      attributions: [
        {
          month: "2026-03",
          executionId: "batch_abc",
          executionStatus: "success",
          executedAt: "2026-03-31T00:00:00.000Z",
          reason: "Monthly pool retirement",
          sharePpm: 500000,
          attributedBudgetUsdCents: 490,
          attributedCostMicro: "4900000",
          paymentDenom: "uusdc",
          attributedQuantity: "2.100000",
          retirementId: "WyRet1",
          txHash: "TX1",
        },
      ],
    });
    const getSubscriptionState = vi.fn().mockResolvedValue({
      customerId: "cus_123",
      email: "user@example.com",
      subscriptionId: "sub_123",
      status: "active",
      tierId: "growth",
      priceId: "price_growth",
      cancelAtPeriodEnd: false,
      currentPeriodEnd: "2026-05-01T00:00:00.000Z",
    });

    const service = new DashboardFrontendService({
      attributionDashboard: { getSubscriberDashboard },
      subscriptions: { getSubscriptionState },
      outputDir,
      publicBaseUrl: "https://regen.network/dashboard",
      certificateBaseUrl: "https://regen.network/certificate",
      now: () => new Date("2026-04-01T12:00:00.000Z"),
    });

    const published = await service.publishSubscriberDashboardPage({
      userId: "user-123",
    });

    expect(published).not.toBeNull();
    expect(published?.pageId).toBe("subscriber-user-123");
    expect(published?.publicUrl).toBe("https://regen.network/dashboard/subscriber-user-123");
    expect(published?.subscriptionState?.status).toBe("active");

    const html = await readFile(published!.filePath, "utf8");
    expect(html).toContain("Subscriber Impact Dashboard");
    expect(html).toContain("Subscription Status");
    expect(html).toContain("growth");
    expect(html).toContain("certificate");
  });

  it("returns null when no subscriber impact dashboard exists", async () => {
    const outputDir = await mkdtemp(path.join(tmpdir(), "regen-dash-empty-"));
    const getSubscriberDashboard = vi.fn().mockResolvedValue(null);
    const getSubscriptionState = vi.fn();
    const service = new DashboardFrontendService({
      attributionDashboard: { getSubscriberDashboard },
      subscriptions: { getSubscriptionState },
      outputDir,
      publicBaseUrl: "https://regen.network/dashboard",
      certificateBaseUrl: "https://regen.network/certificate",
    });

    const published = await service.publishSubscriberDashboardPage({
      userId: "missing-user",
    });

    expect(published).toBeNull();
    expect(getSubscriptionState).not.toHaveBeenCalled();
  });

  it("still publishes when subscription lookup fails", async () => {
    const outputDir = await mkdtemp(path.join(tmpdir(), "regen-dash-suberr-"));
    const getSubscriberDashboard = vi.fn().mockResolvedValue({
      userId: "user-abc",
      contributionCount: 1,
      totalContributedUsdCents: 100,
      totalContributedUsd: 1,
      totalAttributedBudgetUsdCents: 90,
      totalAttributedBudgetUsd: 0.9,
      totalAttributedQuantity: "0.500000",
      attributionCount: 0,
      byMonth: [],
      attributions: [],
    });
    const getSubscriptionState = vi
      .fn()
      .mockRejectedValue(new Error("Missing STRIPE_SECRET_KEY"));

    const service = new DashboardFrontendService({
      attributionDashboard: { getSubscriberDashboard },
      subscriptions: { getSubscriptionState },
      outputDir,
      publicBaseUrl: "https://regen.network/dashboard",
      certificateBaseUrl: "https://regen.network/certificate",
    });

    const published = await service.publishSubscriberDashboardPage({
      userId: "user-abc",
    });

    expect(published).not.toBeNull();
    expect(published?.subscriptionState).toBeNull();
    expect(published?.subscriptionError).toContain("Missing STRIPE_SECRET_KEY");

    const html = await readFile(published!.filePath, "utf8");
    expect(html).toContain("Subscription status unavailable");
  });
});
