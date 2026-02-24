import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadConfig } from "../../config.js";
import {
  AttributionDashboardService,
  type SubscriberImpactDashboard,
} from "../attribution/dashboard.js";
import {
  StripeSubscriptionService,
} from "../subscription/stripe.js";
import type { SubscriptionState } from "../subscription/types.js";

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
  return slug || "dashboard";
}

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatPercent(ppm: number): string {
  return `${(ppm / 10_000).toFixed(2)}%`;
}

function buildSubscriptionSummary(
  state: SubscriptionState | null,
  errorMessage?: string
): {
  status: string;
  tier: string;
  periodEnd: string;
  customerId: string;
  note: string;
} {
  if (!state && errorMessage) {
    return {
      status: "unavailable",
      tier: "N/A",
      periodEnd: "N/A",
      customerId: "N/A",
      note: `Subscription status unavailable: ${errorMessage}`,
    };
  }

  const status = state?.status || "none";
  const tier = state?.tierId || "N/A";
  const periodEnd = state?.currentPeriodEnd || "N/A";
  const customerId = state?.customerId || "N/A";
  const note =
    status === "none"
      ? "No active Stripe subscription found for this identity."
      : state?.cancelAtPeriodEnd
        ? "Subscription is set to cancel at period end."
        : "Subscription is active in recurring mode.";

  return {
    status,
    tier,
    periodEnd,
    customerId,
    note,
  };
}

function buildDashboardHtml(input: {
  dashboard: SubscriberImpactDashboard;
  publicUrl: string;
  generatedAt: string;
  subscriptionSummary: {
    status: string;
    tier: string;
    periodEnd: string;
    customerId: string;
    note: string;
  };
  certificateBaseUrl: string;
}): string {
  const { dashboard, publicUrl, generatedAt, subscriptionSummary, certificateBaseUrl } =
    input;

  const attributionRows = dashboard.attributions
    .slice(0, 24)
    .map((entry) => {
      const certUrl = `${certificateBaseUrl.replace(/\/+$/, "")}/${escapeHtml(`${slugify(entry.month)}-${slugify(dashboard.userId)}-${slugify(entry.executionId)}`)}`;
      return `<tr>
        <td>${escapeHtml(entry.month)}</td>
        <td>${formatPercent(entry.sharePpm)}</td>
        <td>${formatUsd(entry.attributedBudgetUsdCents)}</td>
        <td>${escapeHtml(entry.attributedQuantity)}</td>
        <td>${entry.retirementId ? escapeHtml(entry.retirementId) : "N/A"}</td>
        <td><a href="${certUrl}">certificate</a></td>
      </tr>`;
    })
    .join("");

  const monthlyRows = dashboard.byMonth
    .map(
      (month) => `<tr>
      <td>${escapeHtml(month.month)}</td>
      <td>${formatUsd(month.contributionUsdCents)}</td>
      <td>${formatUsd(month.attributedBudgetUsdCents)}</td>
      <td>${escapeHtml(month.attributedQuantity)}</td>
    </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Subscriber Impact Dashboard</title>
    <meta name="description" content="Subscription contribution and retirement impact dashboard." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;800&family=Playfair+Display:wght@600;800&display=swap" rel="stylesheet" />
    <style>
      :root {
        --ink: #1a2d3f;
        --muted: #4d687d;
        --line: #a5bfd1;
        --accent: #00684a;
        --bg-one: #f8fbff;
        --bg-two: #deefe6;
        --card: rgba(255, 255, 255, 0.88);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Manrope", "Avenir Next", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(110% 100% at 0% 0%, #ffffff 0%, transparent 60%),
          radial-gradient(130% 120% at 100% 100%, #cde6db 0%, transparent 62%),
          linear-gradient(160deg, var(--bg-one), var(--bg-two));
        min-height: 100vh;
        padding: 28px 14px;
      }
      .shell {
        max-width: 1100px;
        margin: 0 auto;
        background: var(--card);
        border: 1px solid var(--line);
        border-radius: 22px;
        overflow: hidden;
        box-shadow: 0 28px 52px rgba(18, 52, 72, 0.12);
        animation: up 360ms ease-out;
      }
      .hero {
        padding: 26px 26px 20px;
        border-bottom: 1px solid var(--line);
      }
      .label {
        display: inline-block;
        border-radius: 999px;
        border: 1px solid #9ad2b6;
        background: #e6f6ed;
        color: #0b6f4d;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 6px 10px;
      }
      h1 {
        margin: 14px 0 8px;
        font: 800 clamp(2rem, 4.8vw, 3.1rem) / 1.02 "Playfair Display", "Georgia", serif;
      }
      .subtitle {
        margin: 0;
        color: var(--muted);
        max-width: 70ch;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
        padding: 18px 26px;
      }
      .card {
        border: 1px solid var(--line);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.62);
        padding: 12px;
      }
      .card .name {
        font-size: 11px;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .card .value {
        margin-top: 7px;
        font-size: 1.05rem;
        font-weight: 700;
      }
      .section {
        border-top: 1px solid var(--line);
        padding: 18px 26px 24px;
      }
      .section h2 {
        margin: 0 0 12px;
        font: 700 1.35rem/1.2 "Playfair Display", "Georgia", serif;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid var(--line);
        border-radius: 10px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.72);
      }
      th, td {
        text-align: left;
        padding: 10px 11px;
        border-top: 1px solid var(--line);
        font-size: 0.92rem;
      }
      th {
        border-top: 0;
        background: rgba(214, 235, 245, 0.55);
        font-size: 0.82rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #2e4f65;
      }
      .meta {
        border-top: 1px solid var(--line);
        padding: 14px 26px 22px;
        color: var(--muted);
        font-size: 0.86rem;
      }
      a { color: var(--accent); }
      @media (max-width: 880px) {
        .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 640px) {
        .hero, .stats, .section, .meta { padding-left: 14px; padding-right: 14px; }
        .stats { grid-template-columns: 1fr; }
        th, td { font-size: 0.88rem; }
      }
      @keyframes up {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <header class="hero">
        <span class="label">Regenerative AI Membership</span>
        <h1>Subscriber Impact Dashboard</h1>
        <p class="subtitle">
          Unified view of contributions, monthly pooled retirement attribution, and current subscription status.
        </p>
      </header>
      <section class="stats">
        <article class="card"><span class="name">User ID</span><span class="value">${escapeHtml(dashboard.userId)}</span></article>
        <article class="card"><span class="name">Total Contributed</span><span class="value">${formatUsd(dashboard.totalContributedUsdCents)}</span></article>
        <article class="card"><span class="name">Attributed Budget</span><span class="value">${formatUsd(dashboard.totalAttributedBudgetUsdCents)}</span></article>
        <article class="card"><span class="name">Attributed Quantity</span><span class="value">${escapeHtml(dashboard.totalAttributedQuantity)} credits</span></article>
      </section>
      <section class="section">
        <h2>Subscription Status</h2>
        <table>
          <thead><tr><th>Status</th><th>Tier</th><th>Customer ID</th><th>Period End</th><th>Notes</th></tr></thead>
          <tbody><tr>
            <td>${escapeHtml(subscriptionSummary.status)}</td>
            <td>${escapeHtml(subscriptionSummary.tier)}</td>
            <td>${escapeHtml(subscriptionSummary.customerId)}</td>
            <td>${escapeHtml(subscriptionSummary.periodEnd)}</td>
            <td>${escapeHtml(subscriptionSummary.note)}</td>
          </tr></tbody>
        </table>
      </section>
      <section class="section">
        <h2>Monthly Contribution History</h2>
        <table>
          <thead><tr><th>Month</th><th>Contributed</th><th>Attributed Budget</th><th>Attributed Quantity</th></tr></thead>
          <tbody>${monthlyRows}</tbody>
        </table>
      </section>
      <section class="section">
        <h2>Recent Attribution Executions</h2>
        <table>
          <thead><tr><th>Month</th><th>Share</th><th>Attributed Budget</th><th>Quantity</th><th>Retirement ID</th><th>Certificate</th></tr></thead>
          <tbody>${attributionRows || `<tr><td colspan="6">No attribution executions yet.</td></tr>`}</tbody>
        </table>
      </section>
      <footer class="meta">
        Dashboard URL: <a href="${escapeHtml(publicUrl)}">${escapeHtml(publicUrl)}</a><br />
        Email: ${dashboard.email ? escapeHtml(dashboard.email) : "N/A"} · Customer ID: ${dashboard.customerId ? escapeHtml(dashboard.customerId) : "N/A"}<br />
        Generated at ${escapeHtml(generatedAt)}.
      </footer>
    </main>
  </body>
</html>`;
}

export interface PublishSubscriberDashboardPageInput {
  userId?: string;
  email?: string;
  customerId?: string;
}

export interface PublishedSubscriberDashboardPage {
  pageId: string;
  filePath: string;
  publicUrl: string;
  generatedAt: string;
  dashboard: SubscriberImpactDashboard;
  subscriptionState?: SubscriptionState | null;
  subscriptionError?: string;
}

export interface DashboardFrontendDeps {
  attributionDashboard: Pick<AttributionDashboardService, "getSubscriberDashboard">;
  subscriptions: Pick<StripeSubscriptionService, "getSubscriptionState">;
  outputDir: string;
  publicBaseUrl: string;
  certificateBaseUrl: string;
  now: () => Date;
}

export class DashboardFrontendService {
  private readonly deps: DashboardFrontendDeps;

  constructor(deps?: Partial<DashboardFrontendDeps>) {
    const config = loadConfig();
    this.deps = {
      attributionDashboard:
        deps?.attributionDashboard || new AttributionDashboardService(),
      subscriptions: deps?.subscriptions || new StripeSubscriptionService(),
      outputDir: deps?.outputDir || config.dashboardOutputDir,
      publicBaseUrl: deps?.publicBaseUrl || config.dashboardBaseUrl,
      certificateBaseUrl: deps?.certificateBaseUrl || config.certificateBaseUrl,
      now: deps?.now || (() => new Date()),
    };
  }

  private resolvedOutputDir(): string {
    return path.isAbsolute(this.deps.outputDir)
      ? this.deps.outputDir
      : path.resolve(process.cwd(), this.deps.outputDir);
  }

  private buildPageId(dashboard: SubscriberImpactDashboard): string {
    return `subscriber-${slugify(dashboard.userId)}`;
  }

  private buildPublicUrl(pageId: string): string {
    return `${this.deps.publicBaseUrl.replace(/\/+$/, "")}/${pageId}`;
  }

  async publishSubscriberDashboardPage(
    input: PublishSubscriberDashboardPageInput
  ): Promise<PublishedSubscriberDashboardPage | null> {
    const dashboard = await this.deps.attributionDashboard.getSubscriberDashboard({
      userId: input.userId,
      email: input.email,
      customerId: input.customerId,
    });
    if (!dashboard) return null;

    let subscriptionState: SubscriptionState | null = null;
    let subscriptionError: string | undefined;
    try {
      subscriptionState = await this.deps.subscriptions.getSubscriptionState({
        email: dashboard.email,
        customerId: dashboard.customerId,
      });
    } catch (error) {
      subscriptionError =
        error instanceof Error ? error.message : "Unknown subscription error";
    }

    const generatedAt = this.deps.now().toISOString();
    const pageId = this.buildPageId(dashboard);
    const publicUrl = this.buildPublicUrl(pageId);
    const subscriptionSummary = buildSubscriptionSummary(
      subscriptionState,
      subscriptionError
    );
    const html = buildDashboardHtml({
      dashboard,
      publicUrl,
      generatedAt,
      subscriptionSummary,
      certificateBaseUrl: this.deps.certificateBaseUrl,
    });

    const outputDir = this.resolvedOutputDir();
    await mkdir(outputDir, { recursive: true });
    const filePath = path.join(outputDir, `${pageId}.html`);
    await writeFile(filePath, html, "utf8");

    return {
      pageId,
      filePath,
      publicUrl,
      generatedAt,
      dashboard,
      subscriptionState,
      subscriptionError,
    };
  }
}
