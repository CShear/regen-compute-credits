import { beforeEach, describe, expect, it, vi } from "vitest";
import { appendIdentityToReason } from "../src/services/identity.js";

const mocks = vi.hoisted(() => ({
  getRetirementById: vi.fn(),
}));

vi.mock("../src/services/indexer.js", () => ({
  getRetirementById: mocks.getRetirementById,
}));

import { getRetirementCertificate } from "../src/tools/certificates.js";

describe("getRetirementCertificate", () => {
  beforeEach(() => {
    mocks.getRetirementById.mockReset();
  });

  it("renders parsed attribution fields from encoded retirement reason metadata", async () => {
    const reason = appendIdentityToReason("Regenerative contribution", {
      authMethod: "oauth",
      beneficiaryName: "Alice",
      beneficiaryEmail: "alice@example.com",
      authProvider: "google",
      authSubject: "oauth-sub-123",
    });

    mocks.getRetirementById.mockResolvedValue({
      nodeId: "WyCert123",
      type: "RETIREMENT",
      amount: "1.000000",
      batchDenom: "C01-001-2026",
      jurisdiction: "US-CA",
      owner: "regen1owner",
      reason,
      timestamp: "2026-02-23T00:00:00.000Z",
      txHash: "ABC123",
      blockHeight: "12345",
      chainNum: 1,
    });

    const result = await getRetirementCertificate("WyCert123");
    const text = result.content[0]?.text ?? "";

    expect(text).toContain("| Reason | Regenerative contribution |");
    expect(text).toContain("| Beneficiary Name | Alice |");
    expect(text).toContain("| Beneficiary Email | alice@example.com |");
    expect(text).toContain("| Auth Provider | google |");
    expect(text).toContain("| Auth Subject | oauth-sub-123 |");
  });
});
