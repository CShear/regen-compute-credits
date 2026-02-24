import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  BatchExecutionState,
  BatchExecutionStore,
} from "./types.js";

const DEFAULT_RELATIVE_EXECUTIONS_PATH = "data/monthly-batch-executions.json";

function getDefaultState(): BatchExecutionState {
  return { version: 1, executions: [] };
}

function isValidState(value: unknown): value is BatchExecutionState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<BatchExecutionState>;
  return candidate.version === 1 && Array.isArray(candidate.executions);
}

export function getDefaultBatchExecutionsPath(): string {
  const configured = process.env.REGEN_BATCH_EXECUTIONS_PATH?.trim();
  if (configured) {
    return path.resolve(configured);
  }
  return path.resolve(process.cwd(), DEFAULT_RELATIVE_EXECUTIONS_PATH);
}

export class JsonFileBatchExecutionStore implements BatchExecutionStore {
  constructor(
    private readonly filePath: string = getDefaultBatchExecutionsPath()
  ) {}

  async readState(): Promise<BatchExecutionState> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      if (!isValidState(parsed)) {
        throw new Error("Invalid monthly batch executions file format");
      }
      return parsed;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return getDefaultState();
      }
      throw err;
    }
  }

  async writeState(state: BatchExecutionState): Promise<void> {
    const dir = path.dirname(this.filePath);
    await mkdir(dir, { recursive: true });

    const tempPath = `${this.filePath}.tmp`;
    await writeFile(tempPath, JSON.stringify(state, null, 2), "utf8");
    await rename(tempPath, this.filePath);
  }
}
