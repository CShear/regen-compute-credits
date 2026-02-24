import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadConfig } from "../../config.js";
import { AttributionDashboardService } from "../attribution/dashboard.js";
import type { SubscriberAttributionCertificate } from "../attribution/dashboard.js";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "entry";
}

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatPercent(ppm: number): string {
  return `${(ppm / 10_000).toFixed(2)}%`;
}

function buildPageHtml(
  certificate: SubscriberAttributionCertificate,
  publicUrl: string,
  generatedAt: string
): string {
  const share = formatPercent(certificate.execution.sharePpm);
  const reason = escapeHtml(certificate.execution.reason);
  const retirementId = certificate.execution.retirementId
    ? escapeHtml(certificate.execution.retirementId)
    : "N/A";
  const txHash = certificate.execution.txHash
    ? escapeHtml(certificate.execution.txHash)
    : "N/A";
  const email = certificate.email ? escapeHtml(certificate.email) : "N/A";
  const customerId = certificate.customerId
    ? escapeHtml(certificate.customerId)
    : "N/A";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Regenerative Contribution Certificate</title>
    <meta name="description" content="Subscriber attribution certificate for monthly pooled retirement." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
    <style>
      :root {
        --bg-top: #f7f4e8;
        --bg-bottom: #d7edd5;
        --card: rgba(253, 251, 244, 0.88);
        --ink: #13302b;
        --muted: #4e7064;
        --line: #9ec6b5;
        --accent: #2e8d66;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Space Grotesk", "Avenir Next", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(120% 100% at 10% 0%, #fbf7df 0%, transparent 55%),
          radial-gradient(140% 120% at 100% 100%, #bddfc2 0%, transparent 60%),
          linear-gradient(165deg, var(--bg-top), var(--bg-bottom));
        padding: 28px 16px;
      }
      .shell {
        max-width: 980px;
        margin: 0 auto;
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 22px;
        overflow: hidden;
        box-shadow: 0 24px 50px rgba(19, 48, 43, 0.12);
        animation: reveal 420ms ease-out;
      }
      .hero {
        padding: 28px 28px 20px;
        border-bottom: 1px solid var(--line);
      }
      .kicker {
        display: inline-block;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #145741;
        background: #dff3e7;
        border: 1px solid #b7dfc8;
        border-radius: 999px;
        padding: 6px 10px;
      }
      h1 {
        margin: 14px 0 8px;
        font-family: "Fraunces", "Georgia", serif;
        font-size: clamp(2rem, 5vw, 3rem);
        line-height: 1.05;
      }
      .subtitle {
        margin: 0;
        font-size: 1rem;
        color: var(--muted);
        max-width: 65ch;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        padding: 20px 28px;
      }
      .metric {
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 12px 14px;
        background: rgba(255, 255, 255, 0.52);
      }
      .metric .label {
        display: block;
        font-size: 12px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--muted);
      }
      .metric .value {
        margin-top: 6px;
        display: block;
        font-size: 1.06rem;
        font-weight: 600;
      }
      .details {
        border-top: 1px solid var(--line);
        padding: 18px 28px 28px;
      }
      .details h2 {
        margin: 0 0 10px;
        font-family: "Fraunces", "Georgia", serif;
        font-size: 1.5rem;
      }
      .kv {
        margin: 0;
        border: 1px solid var(--line);
        border-radius: 12px;
        overflow: hidden;
      }
      .kv div {
        display: grid;
        grid-template-columns: 210px 1fr;
        gap: 12px;
        padding: 10px 12px;
        border-top: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.46);
      }
      .kv div:first-child { border-top: 0; }
      .kv dt {
        margin: 0;
        font-size: 0.9rem;
        color: var(--muted);
      }
      .kv dd {
        margin: 0;
        word-break: break-word;
      }
      footer {
        border-top: 1px solid var(--line);
        padding: 14px 28px 22px;
        font-size: 0.88rem;
        color: var(--muted);
      }
      a { color: var(--accent); }
      @media (max-width: 760px) {
        .hero, .grid, .details, footer { padding-left: 16px; padding-right: 16px; }
        .grid { grid-template-columns: 1fr; }
        .kv div { grid-template-columns: 1fr; }
      }
      @keyframes reveal {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <span class="kicker">Regenerative AI Membership</span>
        <h1>Subscriber Attribution Certificate</h1>
        <p class="subtitle">
          This page verifies your fractional attribution from the pooled monthly retirement run.
          Credits were retired on Regen Ledger with transparent budgeting and protocol fee accounting.
        </p>
      </section>
      <section class="grid">
        <article class="metric"><span class="label">Month</span><span class="value">${escapeHtml(certificate.month)}</span></article>
        <article class="metric"><span class="label">Contribution</span><span class="value">${formatUsd(certificate.contributionUsdCents)}</span></article>
        <article class="metric"><span class="label">Attribution Share</span><span class="value">${share}</span></article>
        <article class="metric"><span class="label">Attributed Budget</span><span class="value">${formatUsd(certificate.execution.attributedBudgetUsdCents)}</span></article>
        <article class="metric"><span class="label">Attributed Quantity</span><span class="value">${escapeHtml(certificate.execution.attributedQuantity)} credits</span></article>
        <article class="metric"><span class="label">Execution Status</span><span class="value">${escapeHtml(certificate.execution.executionStatus)}</span></article>
      </section>
      <section class="details">
        <h2>Certificate Details</h2>
        <dl class="kv">
          <div><dt>User ID</dt><dd>${escapeHtml(certificate.userId)}</dd></div>
          <div><dt>Email</dt><dd>${email}</dd></div>
          <div><dt>Customer ID</dt><dd>${customerId}</dd></div>
          <div><dt>Execution ID</dt><dd>${escapeHtml(certificate.execution.executionId)}</dd></div>
          <div><dt>Retirement ID</dt><dd>${retirementId}</dd></div>
          <div><dt>Transaction Hash</dt><dd>${txHash}</dd></div>
          <div><dt>Retirement Reason</dt><dd>${reason}</dd></div>
          <div><dt>Published URL</dt><dd><a href="${escapeHtml(publicUrl)}">${escapeHtml(publicUrl)}</a></dd></div>
        </dl>
      </section>
      <footer>
        Generated at ${escapeHtml(generatedAt)}. This attribution reflects pooled monthly retirement accounting and on-chain retirement data.
      </footer>
    </main>
  </body>
</html>`;
}

export interface PublishSubscriberCertificatePageInput {
  month: string;
  userId?: string;
  email?: string;
  customerId?: string;
}

export interface PublishedSubscriberCertificatePage {
  pageId: string;
  month: string;
  filePath: string;
  publicUrl: string;
  generatedAt: string;
  certificate: SubscriberAttributionCertificate;
}

export interface CertificateFrontendDeps {
  attributionDashboard: Pick<
    AttributionDashboardService,
    "getSubscriberCertificateForMonth"
  >;
  outputDir: string;
  publicBaseUrl: string;
  now: () => Date;
}

export class CertificateFrontendService {
  private readonly deps: CertificateFrontendDeps;

  constructor(deps?: Partial<CertificateFrontendDeps>) {
    const config = loadConfig();
    this.deps = {
      attributionDashboard:
        deps?.attributionDashboard || new AttributionDashboardService(),
      outputDir: deps?.outputDir || config.certificateOutputDir,
      publicBaseUrl: deps?.publicBaseUrl || config.certificateBaseUrl,
      now: deps?.now || (() => new Date()),
    };
  }

  private resolvedOutputDir(): string {
    return path.isAbsolute(this.deps.outputDir)
      ? this.deps.outputDir
      : path.resolve(process.cwd(), this.deps.outputDir);
  }

  private buildPageId(certificate: SubscriberAttributionCertificate): string {
    return [
      slugify(certificate.month),
      slugify(certificate.userId),
      slugify(certificate.execution.executionId),
    ].join("-");
  }

  private buildPublicUrl(pageId: string): string {
    return `${this.deps.publicBaseUrl.replace(/\/+$/, "")}/${pageId}`;
  }

  async publishSubscriberCertificatePage(
    input: PublishSubscriberCertificatePageInput
  ): Promise<PublishedSubscriberCertificatePage | null> {
    const certificate =
      await this.deps.attributionDashboard.getSubscriberCertificateForMonth({
        month: input.month,
        userId: input.userId,
        email: input.email,
        customerId: input.customerId,
      });

    if (!certificate) return null;

    const generatedAt = this.deps.now().toISOString();
    const pageId = this.buildPageId(certificate);
    const publicUrl = this.buildPublicUrl(pageId);
    const html = buildPageHtml(certificate, publicUrl, generatedAt);

    const outputDir = this.resolvedOutputDir();
    await mkdir(outputDir, { recursive: true });
    const filePath = path.join(outputDir, `${pageId}.html`);
    await writeFile(filePath, html, "utf8");

    return {
      pageId,
      month: certificate.month,
      filePath,
      publicUrl,
      generatedAt,
      certificate,
    };
  }
}
