import { getRetirementById } from "../services/indexer.js";
import { parseAttributedReason } from "../services/identity.js";

export async function getRetirementCertificate(retirementId: string) {
  try {
    // Look up by nodeId or tx hash
    const retirement = await getRetirementById(retirementId);

    if (!retirement) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No retirement certificate found for ID: ${retirementId}\n\nRetirement IDs can be found on the Regen Network block explorer or from previous retirement transactions.`,
          },
        ],
      };
    }

    const parsedReason = parseAttributedReason(retirement.reason);

    const text = [
      `## Retirement Certificate`,
      ``,
      `| Field | Value |`,
      `|-------|-------|`,
      `| Certificate ID | ${retirement.nodeId} |`,
      `| Credits Retired | ${retirement.amount} |`,
      `| Credit Batch | ${retirement.batchDenom} |`,
      `| Beneficiary | ${retirement.owner} |`,
      `| Jurisdiction | ${retirement.jurisdiction} |`,
      `| Reason | ${parsedReason.reasonText} |`,
      `| Timestamp | ${retirement.timestamp} |`,
      `| Block Height | ${retirement.blockHeight} |`,
      `| Transaction Hash | ${retirement.txHash} |`,
    ];

    if (parsedReason.identity?.name) {
      text.push(`| Beneficiary Name | ${parsedReason.identity.name} |`);
    }
    if (parsedReason.identity?.email) {
      text.push(`| Beneficiary Email | ${parsedReason.identity.email} |`);
    }
    if (parsedReason.identity?.provider) {
      text.push(`| Auth Provider | ${parsedReason.identity.provider} |`);
    }
    if (parsedReason.identity?.subject) {
      text.push(`| Auth Subject | ${parsedReason.identity.subject} |`);
    }

    text.push(
      ``,
      `**On-chain verification**: This retirement is permanently recorded on Regen Ledger and cannot be altered or reversed.`
    );

    return { content: [{ type: "text" as const, text: text.join("\n") }] };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      content: [
        {
          type: "text" as const,
          text: `Error retrieving certificate: ${message}`,
        },
      ],
      isError: true,
    };
  }
}
