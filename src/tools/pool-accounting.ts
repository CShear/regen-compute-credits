import { PoolAccountingService } from "../services/pool-accounting/service.js";
import type { ContributionInput } from "../services/pool-accounting/types.js";

const poolAccounting = new PoolAccountingService();

function renderMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export async function recordPoolContributionTool(input: ContributionInput) {
  try {
    const receipt = await poolAccounting.recordContribution(input);
    const title = receipt.duplicate
      ? "## Pool Contribution Already Recorded"
      : "## Pool Contribution Recorded";

    const lines = [
      title,
      "",
      `| Field | Value |`,
      `|-------|-------|`,
      `| Contribution ID | ${receipt.record.id} |`,
      `| User ID | ${receipt.record.userId} |`,
      `| Amount | ${renderMoney(receipt.record.amountUsdCents)} |`,
      `| Month | ${receipt.record.month} |`,
      `| Source | ${receipt.record.source} |`,
      `| Duplicate | ${receipt.duplicate ? "Yes" : "No"} |`,
      `| User Lifetime Total | ${renderMoney(receipt.userSummary.totalUsdCents)} |`,
      `| Month Pool Total | ${renderMoney(receipt.monthSummary.totalUsdCents)} |`,
    ];
    if (receipt.record.externalEventId) {
      lines.splice(9, 0, `| External Event ID | ${receipt.record.externalEventId} |`);
    }

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      content: [
        {
          type: "text" as const,
          text: `Failed to record contribution: ${message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function getPoolAccountingSummaryTool(
  month?: string,
  userId?: string,
  email?: string,
  customerId?: string
) {
  try {
    if (userId || email || customerId) {
      const summary = await poolAccounting.getUserSummary({
        userId,
        email,
        customerId,
      });

      if (!summary) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No contribution history found for that user identifier.",
            },
          ],
        };
      }

      const lines = [
        "## User Contribution Summary",
        "",
        `| Field | Value |`,
        `|-------|-------|`,
        `| User ID | ${summary.userId} |`,
        `| Email | ${summary.email || "N/A"} |`,
        `| Customer ID | ${summary.customerId || "N/A"} |`,
        `| Contribution Count | ${summary.contributionCount} |`,
        `| Lifetime Total | ${renderMoney(summary.totalUsdCents)} |`,
        `| Last Contribution | ${summary.lastContributionAt || "N/A"} |`,
        "",
        "### By Month",
        "",
        "| Month | Count | Total |",
        "|-------|-------|-------|",
        ...summary.byMonth.map(
          (item) =>
            `| ${item.month} | ${item.contributionCount} | ${renderMoney(item.totalUsdCents)} |`
        ),
      ];

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }

    const months = await poolAccounting.listAvailableMonths();
    const targetMonth = month || months[0];

    if (!targetMonth) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No pool accounting records exist yet.",
          },
        ],
      };
    }

    const summary = await poolAccounting.getMonthlySummary(targetMonth);
    const lines = [
      "## Monthly Pool Summary",
      "",
      `| Field | Value |`,
      `|-------|-------|`,
      `| Month | ${summary.month} |`,
      `| Contribution Count | ${summary.contributionCount} |`,
      `| Unique Contributors | ${summary.uniqueContributors} |`,
      `| Total Pool Amount | ${renderMoney(summary.totalUsdCents)} |`,
      "",
      "### Contributors",
      "",
      "| User ID | Contributions | Total |",
      "|---------|---------------|-------|",
      ...summary.contributors.map(
        (item) =>
          `| ${item.userId} | ${item.contributionCount} | ${renderMoney(item.totalUsdCents)} |`
      ),
    ];

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      content: [
        {
          type: "text" as const,
          text: `Failed to query pool accounting: ${message}`,
        },
      ],
      isError: true,
    };
  }
}
