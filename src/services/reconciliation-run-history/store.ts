import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ReconciliationRunState, ReconciliationRunStore } from "./types.js";

const DEFAULT_RELATIVE_RECONCILIATION_RUNS_PATH =
  "data/monthly-reconciliation-runs.json";

function getDefaultState(): ReconciliationRunState {
  return { version: 1, runs: [] };
}

function isValidState(value: unknown): value is ReconciliationRunState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ReconciliationRunState>;
  return candidate.version === 1 && Array.isArray(candidate.runs);
}

export function getDefaultReconciliationRunsPath(): string {
  const configured = process.env.REGEN_RECONCILIATION_RUNS_PATH?.trim();
  if (configured) {
    return path.resolve(configured);
  }
  return path.resolve(process.cwd(), DEFAULT_RELATIVE_RECONCILIATION_RUNS_PATH);
}

export class JsonFileReconciliationRunStore implements ReconciliationRunStore {
  constructor(
    private readonly filePath: string = getDefaultReconciliationRunsPath()
  ) {}

  async readState(): Promise<ReconciliationRunState> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      if (!isValidState(parsed)) {
        throw new Error("Invalid monthly reconciliation runs file format");
      }
      return parsed;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return getDefaultState();
      }
      throw err;
    }
  }

  async writeState(state: ReconciliationRunState): Promise<void> {
    const dir = path.dirname(this.filePath);
    await mkdir(dir, { recursive: true });

    const tempPath = `${this.filePath}.tmp`;
    await writeFile(tempPath, JSON.stringify(state, null, 2), "utf8");
    await rename(tempPath, this.filePath);
  }
}
