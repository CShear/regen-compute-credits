import { DashboardFrontendService } from "../services/dashboard-frontend/service.js";

const dashboardFrontend = new DashboardFrontendService();

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export async function publishSubscriberDashboardPageTool(
  userId?: string,
  email?: string,
  customerId?: string
) {
  try {
    const published = await dashboardFrontend.publishSubscriberDashboardPage({
      userId,
      email,
      customerId,
    });

    if (!published) {
      return {
        content: [
          {
            type: "text" as const,
            text:
              "No subscriber dashboard data found for the provided identifier, so no dashboard page was published.",
          },
        ],
      };
    }

    const lines = [
      "## Subscriber Dashboard Page Published",
      "",
      "| Field | Value |",
      "|-------|-------|",
      `| Page ID | ${published.pageId} |`,
      `| User ID | ${published.dashboard.userId} |`,
      `| Contribution Count | ${published.dashboard.contributionCount} |`,
      `| Total Contributed | ${formatUsd(published.dashboard.totalContributedUsdCents)} |`,
      `| Total Attributed Budget | ${formatUsd(published.dashboard.totalAttributedBudgetUsdCents)} |`,
      `| Attributed Quantity | ${published.dashboard.totalAttributedQuantity} credits |`,
      `| Public URL | ${published.publicUrl} |`,
      `| Local File | ${published.filePath} |`,
      `| Generated At | ${published.generatedAt} |`,
    ];

    if (published.subscriptionState) {
      lines.push(
        `| Subscription Status | ${published.subscriptionState.status} |`,
        `| Subscription Tier | ${published.subscriptionState.tierId || "N/A"} |`,
        `| Subscription Period End | ${published.subscriptionState.currentPeriodEnd || "N/A"} |`
      );
    } else if (published.subscriptionError) {
      lines.push(`| Subscription Status | unavailable (${published.subscriptionError}) |`);
    }

    lines.push(
      "",
      "Use this page URL in product navigation and user account surfaces."
    );

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown dashboard page error";
    return {
      content: [
        {
          type: "text" as const,
          text: `Failed to publish subscriber dashboard page: ${message}`,
        },
      ],
      isError: true,
    };
  }
}
