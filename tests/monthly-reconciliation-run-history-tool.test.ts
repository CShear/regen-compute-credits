import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getHistory: vi.fn(),
}));

vi.mock("../src/services/reconciliation-run-history/service.js", () => ({
  ReconciliationRunHistoryService: class {
    getHistory(input: unknown) {
      return mocks.getHistory(input);
    }

    startRun() {
      throw new Error("not implemented for this test");
    }

    finishRun() {
      throw new Error("not implemented for this test");
    }

    recordBlockedRun() {
      throw new Error("not implemented for this test");
    }
  },
}));

import { getMonthlyReconciliationRunHistoryTool } from "../src/tools/monthly-batch-retirement.js";

function responseText(result: { content: Array<{ type: "text"; text: string }> }): string {
  return result.content[0]?.text ?? "";
}

describe("getMonthlyReconciliationRunHistoryTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getHistory.mockResolvedValue([
      {
        id: "reconcile_1",
        month: "2026-03",
        creditType: "carbon",
        syncScope: "all_customers",
        executionMode: "dry_run",
        preflightOnly: false,
        force: false,
        status: "completed",
        batchStatus: "dry_run",
        startedAt: "2026-03-01T00:00:00.000Z",
        finishedAt: "2026-03-01T00:00:02.000Z",
        sync: {
          scope: "all_customers",
          fetchedInvoiceCount: 10,
          processedInvoiceCount: 10,
          syncedCount: 9,
          duplicateCount: 1,
          skippedCount: 0,
          truncated: false,
        },
      },
    ]);
  });

  it("returns reconciliation run history table", async () => {
    const result = await getMonthlyReconciliationRunHistoryTool(
      "2026-03",
      "completed",
      "carbon",
      25
    );
    const text = responseText(result);

    expect(mocks.getHistory).toHaveBeenCalledWith({
      month: "2026-03",
      status: "completed",
      creditType: "carbon",
      limit: 25,
      newestFirst: true,
    });
    expect(text).toContain("## Monthly Reconciliation Run History");
    expect(text).toContain("| Returned Records | 1 |");
    expect(text).toContain("| reconcile_1 |");
    expect(text).toContain("| completed |");
    expect(text).toContain("9/10 synced");
  });

  it("returns empty-state message when no records match", async () => {
    mocks.getHistory.mockResolvedValueOnce([]);
    const result = await getMonthlyReconciliationRunHistoryTool("2026-03");
    const text = responseText(result);

    expect(text).toContain("| Returned Records | 0 |");
    expect(text).toContain("No reconciliation runs matched the provided filters.");
  });

  it("returns error response when query fails", async () => {
    mocks.getHistory.mockRejectedValueOnce(
      new Error("month must be in YYYY-MM format")
    );
    const result = await getMonthlyReconciliationRunHistoryTool("03-2026");

    expect(result.isError).toBe(true);
    expect(responseText(result)).toContain(
      "Reconciliation run history query failed: month must be in YYYY-MM format"
    );
  });
});
