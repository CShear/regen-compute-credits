import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PoolAccountingState, PoolAccountingStore } from "./types.js";

const DEFAULT_RELATIVE_LEDGER_PATH = "data/pool-accounting-ledger.json";

function getDefaultState(): PoolAccountingState {
  return { version: 1, contributions: [] };
}

function isValidState(value: unknown): value is PoolAccountingState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PoolAccountingState>;
  return candidate.version === 1 && Array.isArray(candidate.contributions);
}

export function getDefaultPoolAccountingPath(): string {
  const configured = process.env.REGEN_POOL_ACCOUNTING_PATH?.trim();
  if (configured) {
    return path.resolve(configured);
  }
  return path.resolve(process.cwd(), DEFAULT_RELATIVE_LEDGER_PATH);
}

export class JsonFilePoolAccountingStore implements PoolAccountingStore {
  constructor(private readonly filePath: string = getDefaultPoolAccountingPath()) {}

  async readState(): Promise<PoolAccountingState> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      if (!isValidState(parsed)) {
        throw new Error("Invalid pool accounting ledger format");
      }
      return parsed;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return getDefaultState();
      }
      throw err;
    }
  }

  async writeState(state: PoolAccountingState): Promise<void> {
    const dir = path.dirname(this.filePath);
    await mkdir(dir, { recursive: true });

    const tempPath = `${this.filePath}.tmp`;
    await writeFile(tempPath, JSON.stringify(state, null, 2), "utf8");
    await rename(tempPath, this.filePath);
  }
}
