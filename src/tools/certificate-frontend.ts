import { CertificateFrontendService } from "../services/certificate-frontend/service.js";

const certificateFrontend = new CertificateFrontendService();

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export async function publishSubscriberCertificatePageTool(
  month: string,
  userId?: string,
  email?: string,
  customerId?: string
) {
  try {
    const published = await certificateFrontend.publishSubscriberCertificatePage({
      month,
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
              "No attribution certificate found for the provided user/month combination, so no certificate page was published.",
          },
        ],
      };
    }

    const sharePercent = (published.certificate.execution.sharePpm / 10_000).toFixed(2);
    const lines = [
      "## Subscriber Certificate Page Published",
      "",
      "| Field | Value |",
      "|-------|-------|",
      `| Page ID | ${published.pageId} |`,
      `| Month | ${published.month} |`,
      `| User ID | ${published.certificate.userId} |`,
      `| Attribution Share | ${sharePercent}% |`,
      `| Attributed Budget | ${formatUsd(published.certificate.execution.attributedBudgetUsdCents)} |`,
      `| Attributed Quantity | ${published.certificate.execution.attributedQuantity} credits |`,
      `| Public URL | ${published.publicUrl} |`,
      `| Local File | ${published.filePath} |`,
      `| Generated At | ${published.generatedAt} |`,
      "",
      "Use this page URL in user-facing dashboards, emails, or receipts.",
    ];

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown certificate page error";
    return {
      content: [
        {
          type: "text" as const,
          text: `Failed to publish subscriber certificate page: ${message}`,
        },
      ],
      isError: true,
    };
  }
}
