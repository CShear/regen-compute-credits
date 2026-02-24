import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { CertificateFrontendService } from "../src/services/certificate-frontend/service.js";

describe("CertificateFrontendService", () => {
  it("publishes a subscriber certificate HTML page to disk", async () => {
    const outputDir = await mkdtemp(path.join(tmpdir(), "regen-cert-"));
    const getSubscriberCertificateForMonth = vi.fn().mockResolvedValue({
      userId: "user-123",
      email: "user@example.com",
      customerId: "cus_123",
      month: "2026-03",
      contributionUsdCents: 500,
      contributionUsd: 5,
      execution: {
        month: "2026-03",
        executionId: "batch_abc",
        executionStatus: "success",
        executedAt: "2026-03-31T00:00:00.000Z",
        reason: "Monthly pool retirement",
        sharePpm: 500000,
        attributedBudgetUsdCents: 250,
        attributedCostMicro: "2500000",
        paymentDenom: "uusdc",
        attributedQuantity: "1.250000",
        retirementId: "WyRet123",
        txHash: "TX123",
      },
    });

    const service = new CertificateFrontendService({
      attributionDashboard: { getSubscriberCertificateForMonth },
      outputDir,
      publicBaseUrl: "https://regen.network/certificate",
      now: () => new Date("2026-04-01T12:00:00.000Z"),
    });

    const published = await service.publishSubscriberCertificatePage({
      month: "2026-03",
      userId: "user-123",
    });

    expect(published).not.toBeNull();
    expect(published?.pageId).toBe("2026-03-user-123-batch-abc");
    expect(published?.publicUrl).toBe(
      "https://regen.network/certificate/2026-03-user-123-batch-abc"
    );

    const html = await readFile(published!.filePath, "utf8");
    expect(html).toContain("Subscriber Attribution Certificate");
    expect(html).toContain("Monthly pool retirement");
    expect(html).toContain("2026-03-user-123-batch-abc");
  });

  it("returns null when no matching attribution certificate exists", async () => {
    const outputDir = await mkdtemp(path.join(tmpdir(), "regen-cert-empty-"));
    const getSubscriberCertificateForMonth = vi.fn().mockResolvedValue(null);
    const service = new CertificateFrontendService({
      attributionDashboard: { getSubscriberCertificateForMonth },
      outputDir,
      publicBaseUrl: "https://regen.network/certificate",
    });

    const published = await service.publishSubscriberCertificatePage({
      month: "2026-03",
      userId: "missing-user",
    });

    expect(published).toBeNull();
  });

  it("escapes HTML content in rendered fields", async () => {
    const outputDir = await mkdtemp(path.join(tmpdir(), "regen-cert-escape-"));
    const getSubscriberCertificateForMonth = vi.fn().mockResolvedValue({
      userId: "user-esc",
      email: "user@example.com",
      customerId: "cus_esc",
      month: "2026-03",
      contributionUsdCents: 300,
      contributionUsd: 3,
      execution: {
        month: "2026-03",
        executionId: "batch_escape",
        executionStatus: "success",
        executedAt: "2026-03-31T00:00:00.000Z",
        reason: "<script>alert('x')</script>",
        sharePpm: 1000000,
        attributedBudgetUsdCents: 300,
        attributedCostMicro: "3000000",
        paymentDenom: "uusdc",
        attributedQuantity: "1.500000",
      },
    });

    const service = new CertificateFrontendService({
      attributionDashboard: { getSubscriberCertificateForMonth },
      outputDir,
      publicBaseUrl: "https://regen.network/certificate",
    });

    const published = await service.publishSubscriberCertificatePage({
      month: "2026-03",
      userId: "user-esc",
    });
    const html = await readFile(published!.filePath, "utf8");

    expect(html).toContain("&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert('x')</script>");
  });
});
