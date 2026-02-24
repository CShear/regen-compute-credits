import { AttributionDashboardService } from "../services/attribution/dashboard.js";

const attributionDashboard = new AttributionDashboardService();

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export async function getSubscriberImpactDashboardTool(
  userId?: string,
  email?: string,
  customerId?: string
) {
  try {
    const dashboard = await attributionDashboard.getSubscriberDashboard({
      userId,
      email,
      customerId,
    });

    if (!dashboard) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No subscriber contribution history found for the provided identifier.",
          },
        ],
      };
    }

    const lines = [
      "## Subscriber Impact Dashboard",
      "",
      "| Field | Value |",
      "|-------|-------|",
      `| User ID | ${dashboard.userId} |`,
      `| Email | ${dashboard.email || "N/A"} |`,
      `| Customer ID | ${dashboard.customerId || "N/A"} |`,
      `| Contribution Count | ${dashboard.contributionCount} |`,
      `| Total Contributed | ${formatUsd(dashboard.totalContributedUsdCents)} |`,
      `| Attributed Retirements | ${dashboard.attributionCount} |`,
      `| Total Attributed Budget | ${formatUsd(dashboard.totalAttributedBudgetUsdCents)} |`,
      `| Total Attributed Quantity | ${dashboard.totalAttributedQuantity} credits |`,
      "",
      "### Monthly History",
      "",
      "| Month | Contributed | Attributed Budget | Attributed Quantity |",
      "|-------|-------------|-------------------|---------------------|",
      ...dashboard.byMonth.map(
        (month) =>
          `| ${month.month} | ${formatUsd(month.contributionUsdCents)} | ${formatUsd(month.attributedBudgetUsdCents)} | ${month.attributedQuantity} |`
      ),
    ];

    if (dashboard.attributions.length > 0) {
      lines.push(
        "",
        "### Attribution Executions",
        "",
        "| Month | Share | Attributed Budget | Retirement ID | Tx Hash |",
        "|-------|-------|-------------------|---------------|---------|",
        ...dashboard.attributions.slice(0, 25).map((entry) => {
          const sharePercent = (entry.sharePpm / 10_000).toFixed(2);
          return `| ${entry.month} | ${sharePercent}% | ${formatUsd(entry.attributedBudgetUsdCents)} | ${entry.retirementId || "N/A"} | ${entry.txHash || "N/A"} |`;
        })
      );
      if (dashboard.attributions.length > 25) {
        lines.push(
          "",
          `Showing 25 of ${dashboard.attributions.length} attribution execution rows.`
        );
      }
    }

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown dashboard error";
    return {
      content: [
        {
          type: "text" as const,
          text: `Failed to load subscriber dashboard: ${message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function getSubscriberAttributionCertificateTool(
  month: string,
  userId?: string,
  email?: string,
  customerId?: string
) {
  try {
    const certificate =
      await attributionDashboard.getSubscriberCertificateForMonth({
        month,
        userId,
        email,
        customerId,
      });

    if (!certificate) {
      return {
        content: [
          {
            type: "text" as const,
            text:
              "No attribution certificate found for the provided user/month combination.",
          },
        ],
      };
    }

    const sharePercent = (certificate.execution.sharePpm / 10_000).toFixed(2);
    const lines = [
      "## Subscriber Attribution Certificate",
      "",
      "| Field | Value |",
      "|-------|-------|",
      `| Month | ${certificate.month} |`,
      `| User ID | ${certificate.userId} |`,
      `| Email | ${certificate.email || "N/A"} |`,
      `| Customer ID | ${certificate.customerId || "N/A"} |`,
      `| Contribution | ${formatUsd(certificate.contributionUsdCents)} |`,
      `| Attribution Share | ${sharePercent}% |`,
      `| Attributed Budget | ${formatUsd(certificate.execution.attributedBudgetUsdCents)} |`,
      `| Attributed Quantity | ${certificate.execution.attributedQuantity} credits |`,
      `| Retirement ID | ${certificate.execution.retirementId || "N/A"} |`,
      `| Transaction Hash | ${certificate.execution.txHash || "N/A"} |`,
      `| Retirement Reason | ${certificate.execution.reason} |`,
      "",
      "This certificate reflects your fractional attribution in the monthly pooled retirement batch.",
    ];

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown certificate error";
    return {
      content: [
        {
          type: "text" as const,
          text: `Failed to load attribution certificate: ${message}`,
        },
      ],
      isError: true,
    };
  }
}
