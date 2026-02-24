import { describe, expect, it } from "vitest";
import { ReconciliationRunHistoryService } from "../src/services/reconciliation-run-history/service.js";
import type {
  ReconciliationRunState,
  ReconciliationRunStore,
} from "../src/services/reconciliation-run-history/types.js";

class InMemoryReconciliationRunStore implements ReconciliationRunStore {
  private state: ReconciliationRunState = { version: 1, runs: [] };

  async readState(): Promise<ReconciliationRunState> {
    return JSON.parse(JSON.stringify(this.state)) as ReconciliationRunState;
  }

  async writeState(state: ReconciliationRunState): Promise<void> {
    this.state = JSON.parse(JSON.stringify(state)) as ReconciliationRunState;
  }
}

describe("ReconciliationRunHistoryService", () => {
  it("starts and finishes runs with persisted status fields", async () => {
    const service = new ReconciliationRunHistoryService(
      new InMemoryReconciliationRunStore()
    );

    const started = await service.startRun({
      month: "2026-03",
      creditType: "carbon",
      syncScope: "all_customers",
      executionMode: "dry_run",
      preflightOnly: false,
      force: false,
    });

    expect(started.id).toMatch(/^reconcile_/);
    expect(started.status).toBe("in_progress");
    expect(started.batchStatus).toBe("in_progress");

    const finished = await service.finishRun(started.id, {
      status: "completed",
      batchStatus: "dry_run",
      sync: {
        scope: "all_customers",
        fetchedInvoiceCount: 10,
        processedInvoiceCount: 10,
        syncedCount: 9,
        duplicateCount: 1,
        skippedCount: 0,
        truncated: false,
      },
      message: "Dry run complete",
    });

    expect(finished.status).toBe("completed");
    expect(finished.batchStatus).toBe("dry_run");
    expect(finished.finishedAt).toBeDefined();
    expect(finished.sync?.syncedCount).toBe(9);

    const history = await service.getHistory({ month: "2026-03" });
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({
      id: started.id,
      status: "completed",
      batchStatus: "dry_run",
      month: "2026-03",
      creditType: "carbon",
    });
  });

  it("records blocked runs and supports status filtering", async () => {
    const service = new ReconciliationRunHistoryService(
      new InMemoryReconciliationRunStore()
    );

    const blocked = await service.recordBlockedRun({
      month: "2026-03",
      syncScope: "all_customers",
      executionMode: "live",
      preflightOnly: false,
      force: false,
      batchStatus: "blocked_preflight",
      message: "latest run is not dry_run",
    });

    expect(blocked.status).toBe("blocked");
    expect(blocked.finishedAt).toBeDefined();

    const blockedOnly = await service.getHistory({ status: "blocked" });
    expect(blockedOnly).toHaveLength(1);
    expect(blockedOnly[0]).toMatchObject({
      id: blocked.id,
      batchStatus: "blocked_preflight",
    });
  });

  it("validates month format for writes and queries", async () => {
    const service = new ReconciliationRunHistoryService(
      new InMemoryReconciliationRunStore()
    );

    await expect(
      service.startRun({
        month: "03-2026",
        syncScope: "none",
        executionMode: "dry_run",
        preflightOnly: false,
        force: false,
      })
    ).rejects.toThrow("month must be in YYYY-MM format");

    await expect(service.getHistory({ month: "03-2026" })).rejects.toThrow(
      "month must be in YYYY-MM format"
    );
  });
});
