import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_RELATIVE_AUTH_PATH = "data/auth-state.json";

function resolveAuthPath(): string {
  const configured = process.env.REGEN_AUTH_STORE_PATH?.trim();
  const target = configured || DEFAULT_RELATIVE_AUTH_PATH;
  if (path.isAbsolute(target)) return target;
  return path.resolve(process.cwd(), target);
}

export type AuthSessionMethod = "email" | "oauth";
export type AuthSessionStatus = "pending" | "verified" | "expired" | "locked";

export interface AuthSessionRecord {
  id: string;
  method: AuthSessionMethod;
  status: AuthSessionStatus;
  createdAt: string;
  expiresAt: string;
  verifiedAt?: string;
  beneficiaryName?: string;
  beneficiaryEmail?: string;
  authProvider?: string;
  authSubject?: string;
  emailCodeHash?: string;
  oauthStateToken?: string;
  verificationAttempts: number;
  maxVerificationAttempts: number;
}

export interface IdentityLinkRecord {
  userId: string;
  sessionId: string;
  method: AuthSessionMethod;
  beneficiaryEmail?: string;
  authProvider?: string;
  authSubject?: string;
  linkedAt: string;
}

export interface RecoveryTokenRecord {
  id: string;
  tokenHash: string;
  sessionId: string;
  beneficiaryEmail: string;
  createdAt: string;
  expiresAt: string;
  consumedAt?: string;
}

export interface AuthState {
  version: 1;
  sessions: AuthSessionRecord[];
  links: IdentityLinkRecord[];
  recoveries: RecoveryTokenRecord[];
}

export interface AuthStore {
  readState(): Promise<AuthState>;
  writeState(state: AuthState): Promise<void>;
}

function defaultState(): AuthState {
  return {
    version: 1,
    sessions: [],
    links: [],
    recoveries: [],
  };
}

function parseState(raw: string): AuthState {
  const parsed = JSON.parse(raw) as Partial<AuthState>;
  if (
    parsed.version !== 1 ||
    !Array.isArray(parsed.sessions) ||
    !Array.isArray(parsed.links) ||
    !Array.isArray(parsed.recoveries)
  ) {
    throw new Error("Invalid auth state file format");
  }
  return {
    version: 1,
    sessions: parsed.sessions as AuthSessionRecord[],
    links: parsed.links as IdentityLinkRecord[],
    recoveries: parsed.recoveries as RecoveryTokenRecord[],
  };
}

export class JsonFileAuthStore implements AuthStore {
  private readonly filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath ? path.resolve(filePath) : resolveAuthPath();
  }

  async readState(): Promise<AuthState> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      return parseState(raw);
    } catch (error: any) {
      if (error && error.code === "ENOENT") {
        return defaultState();
      }
      throw error;
    }
  }

  async writeState(state: AuthState): Promise<void> {
    const dir = path.dirname(this.filePath);
    await mkdir(dir, { recursive: true });
    await writeFile(this.filePath, JSON.stringify(state, null, 2), "utf8");
  }
}
