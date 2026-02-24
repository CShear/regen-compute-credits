import {
  createHash,
  createHmac,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { captureIdentity, type IdentityAttribution } from "../identity.js";
import {
  JsonFileAuthStore,
  type AuthSessionMethod,
  type AuthSessionRecord,
  type AuthSessionStatus,
  type AuthState,
  type AuthStore,
  type IdentityLinkRecord,
  type RecoveryTokenRecord,
} from "./store.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_SESSION_TTL_SECONDS = 15 * 60;
const DEFAULT_RECOVERY_TTL_SECONDS = 24 * 60 * 60;
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_ALLOWED_OAUTH_PROVIDERS = ["google", "github"];
const DEFAULT_AUTH_SECRET = "regen-dev-auth-secret-change-me";

function normalize(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeEmail(value?: string | null): string | undefined {
  const email = normalize(value)?.toLowerCase();
  if (!email) return undefined;
  return email;
}

function parseIntEnv(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

function splitCsv(value?: string): string[] {
  return (value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeProviders(value?: string[]): string[] {
  return (value || [])
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function toIsoDate(now: Date, secondsToAdd: number): string {
  return new Date(now.getTime() + secondsToAdd * 1000).toISOString();
}

function isExpired(now: Date, expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= now.getTime();
}

function toBuffer(input: string): Buffer {
  return Buffer.from(input, "utf8");
}

function safeEquals(a: string, b: string): boolean {
  const aBuf = toBuffer(a);
  const bBuf = toBuffer(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export interface AuthSessionPublic {
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
  verificationAttempts: number;
  maxVerificationAttempts: number;
}

export interface StartEmailAuthResult {
  session: AuthSessionPublic;
  verificationCode: string;
}

export interface StartOAuthAuthResult {
  session: AuthSessionPublic;
  oauthStateToken: string;
}

export interface VerifyIdentityResult {
  session: AuthSessionPublic;
  identity: IdentityAttribution;
}

export interface StartRecoveryResult {
  recoveryToken: string;
  expiresAt: string;
  sessionId: string;
}

export interface RecoverIdentityResult {
  session: AuthSessionPublic;
}

export interface AuthServiceDeps {
  store: AuthStore;
  now: () => Date;
  secret: string;
  sessionTtlSeconds: number;
  recoveryTtlSeconds: number;
  maxVerificationAttempts: number;
  allowedOauthProviders: string[];
}

function stripSession(session: AuthSessionRecord): AuthSessionPublic {
  return {
    id: session.id,
    method: session.method,
    status: session.status,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    verifiedAt: session.verifiedAt,
    beneficiaryName: session.beneficiaryName,
    beneficiaryEmail: session.beneficiaryEmail,
    authProvider: session.authProvider,
    authSubject: session.authSubject,
    verificationAttempts: session.verificationAttempts,
    maxVerificationAttempts: session.maxVerificationAttempts,
  };
}

export class AuthSessionService {
  private readonly deps: AuthServiceDeps;

  constructor(deps?: Partial<AuthServiceDeps>) {
    const depAllowedProviders = normalizeProviders(deps?.allowedOauthProviders);
    const envAllowedProviders = splitCsv(process.env.REGEN_AUTH_ALLOWED_OAUTH_PROVIDERS);
    const allowedOauthProviders =
      depAllowedProviders.length > 0
        ? depAllowedProviders
        : envAllowedProviders.length > 0
          ? envAllowedProviders
          : DEFAULT_ALLOWED_OAUTH_PROVIDERS;

    this.deps = {
      store: deps?.store || new JsonFileAuthStore(),
      now: deps?.now || (() => new Date()),
      secret:
        normalize(deps?.secret) ||
        normalize(process.env.REGEN_AUTH_SECRET) ||
        DEFAULT_AUTH_SECRET,
      sessionTtlSeconds:
        deps?.sessionTtlSeconds ||
        parseIntEnv("REGEN_AUTH_SESSION_TTL_SECONDS", DEFAULT_SESSION_TTL_SECONDS),
      recoveryTtlSeconds:
        deps?.recoveryTtlSeconds ||
        parseIntEnv(
          "REGEN_AUTH_RECOVERY_TTL_SECONDS",
          DEFAULT_RECOVERY_TTL_SECONDS
        ),
      maxVerificationAttempts:
        deps?.maxVerificationAttempts ||
        parseIntEnv("REGEN_AUTH_MAX_ATTEMPTS", DEFAULT_MAX_ATTEMPTS),
      allowedOauthProviders,
    };
  }

  private sessionId(): string {
    return `auth_${randomUUID()}`;
  }

  private recoveryId(): string {
    return `recovery_${randomUUID()}`;
  }

  private hash(value: string): string {
    return createHash("sha256")
      .update(this.deps.secret)
      .update(":")
      .update(value)
      .digest("hex");
  }

  private sign(payload: string): string {
    return createHmac("sha256", this.deps.secret).update(payload).digest("base64url");
  }

  private issueOauthStateToken(input: { sessionId: string; expiresAt: string }): string {
    const payload = Buffer.from(
      JSON.stringify({ sid: input.sessionId, exp: input.expiresAt }),
      "utf8"
    ).toString("base64url");
    const sig = this.sign(payload);
    return `${payload}.${sig}`;
  }

  private validateOauthStateToken(session: AuthSessionRecord, token: string): void {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) throw new Error("Invalid oauth_state_token format");
    const expected = this.sign(payload);
    if (!safeEquals(sig, expected)) {
      throw new Error("Invalid oauth_state_token signature");
    }
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { sid?: string; exp?: string };
    if (!decoded.sid || decoded.sid !== session.id) {
      throw new Error("oauth_state_token session mismatch");
    }
    if (!decoded.exp || isExpired(this.deps.now(), decoded.exp)) {
      throw new Error("oauth_state_token is expired");
    }
  }

  private createEmailCode(): string {
    const value = randomInt(0, 1_000_000);
    return value.toString().padStart(6, "0");
  }

  private requireSession(state: AuthState, sessionId: string): AuthSessionRecord {
    const session = state.sessions.find((item) => item.id === sessionId);
    if (!session) {
      throw new Error(`Unknown auth session: ${sessionId}`);
    }
    return session;
  }

  private mutateSessionStatusForTime(session: AuthSessionRecord): void {
    if (
      session.status === "pending" &&
      isExpired(this.deps.now(), session.expiresAt)
    ) {
      session.status = "expired";
    }
  }

  private ensureVerifiableSession(session: AuthSessionRecord, method: AuthSessionMethod): void {
    this.mutateSessionStatusForTime(session);

    if (session.method !== method) {
      throw new Error(`Auth session method mismatch. Expected ${method}.`);
    }
    if (session.status === "locked") {
      throw new Error("Auth session is locked after too many failed attempts");
    }
    if (session.status === "expired") {
      throw new Error("Auth session is expired");
    }
    if (session.status === "verified") {
      throw new Error("Auth session is already verified");
    }
  }

  private buildIdentityFromSession(session: AuthSessionRecord): IdentityAttribution {
    const identity = captureIdentity({
      beneficiaryName: session.beneficiaryName,
      beneficiaryEmail: session.beneficiaryEmail,
      authProvider: session.authProvider,
      authSubject: session.authSubject,
    });
    if (identity.authMethod === "none") {
      throw new Error("Verified auth session has no identity payload");
    }
    return identity;
  }

  async startEmailAuth(input: {
    beneficiaryEmail: string;
    beneficiaryName?: string;
  }): Promise<StartEmailAuthResult> {
    const email = normalizeEmail(input.beneficiaryEmail);
    if (!email || !EMAIL_PATTERN.test(email)) {
      throw new Error("beneficiary_email must be a valid email");
    }

    const now = this.deps.now();
    const code = this.createEmailCode();
    const session: AuthSessionRecord = {
      id: this.sessionId(),
      method: "email",
      status: "pending",
      createdAt: now.toISOString(),
      expiresAt: toIsoDate(now, this.deps.sessionTtlSeconds),
      beneficiaryName: normalize(input.beneficiaryName),
      beneficiaryEmail: email,
      emailCodeHash: this.hash(`${code}:${email}`),
      verificationAttempts: 0,
      maxVerificationAttempts: this.deps.maxVerificationAttempts,
    };

    const state = await this.deps.store.readState();
    state.sessions.push(session);
    await this.deps.store.writeState(state);

    return {
      session: stripSession(session),
      verificationCode: code,
    };
  }

  async verifyEmailAuth(input: {
    sessionId: string;
    verificationCode: string;
  }): Promise<VerifyIdentityResult> {
    const code = normalize(input.verificationCode);
    if (!code || !/^\d{6}$/.test(code)) {
      throw new Error("verification_code must be a 6-digit code");
    }

    const state = await this.deps.store.readState();
    const session = this.requireSession(state, input.sessionId);
    this.ensureVerifiableSession(session, "email");

    const email = session.beneficiaryEmail;
    if (!email || !session.emailCodeHash) {
      throw new Error("Email auth session is missing challenge data");
    }

    const actual = this.hash(`${code}:${email}`);
    if (!safeEquals(actual, session.emailCodeHash)) {
      session.verificationAttempts += 1;
      if (session.verificationAttempts >= session.maxVerificationAttempts) {
        session.status = "locked";
      }
      await this.deps.store.writeState(state);
      throw new Error("Invalid verification_code");
    }

    session.status = "verified";
    session.verifiedAt = this.deps.now().toISOString();
    await this.deps.store.writeState(state);

    return {
      session: stripSession(session),
      identity: this.buildIdentityFromSession(session),
    };
  }

  async startOAuthAuth(input: {
    authProvider: string;
    beneficiaryName?: string;
    beneficiaryEmail?: string;
  }): Promise<StartOAuthAuthResult> {
    const provider = normalize(input.authProvider)?.toLowerCase();
    if (!provider) {
      throw new Error("auth_provider is required");
    }
    if (!this.deps.allowedOauthProviders.includes(provider)) {
      throw new Error(
        `Unsupported auth_provider '${provider}'. Allowed providers: ${this.deps.allowedOauthProviders.join(", ")}`
      );
    }

    const email = normalizeEmail(input.beneficiaryEmail);
    if (email && !EMAIL_PATTERN.test(email)) {
      throw new Error("beneficiary_email must be a valid email");
    }

    const now = this.deps.now();
    const session: AuthSessionRecord = {
      id: this.sessionId(),
      method: "oauth",
      status: "pending",
      createdAt: now.toISOString(),
      expiresAt: toIsoDate(now, this.deps.sessionTtlSeconds),
      beneficiaryName: normalize(input.beneficiaryName),
      beneficiaryEmail: email,
      authProvider: provider,
      verificationAttempts: 0,
      maxVerificationAttempts: this.deps.maxVerificationAttempts,
    };

    const oauthStateToken = this.issueOauthStateToken({
      sessionId: session.id,
      expiresAt: session.expiresAt,
    });
    session.oauthStateToken = oauthStateToken;

    const state = await this.deps.store.readState();
    state.sessions.push(session);
    await this.deps.store.writeState(state);

    return {
      session: stripSession(session),
      oauthStateToken,
    };
  }

  async verifyOAuthAuth(input: {
    sessionId: string;
    oauthStateToken: string;
    authProvider: string;
    authSubject: string;
    beneficiaryEmail?: string;
  }): Promise<VerifyIdentityResult> {
    const provider = normalize(input.authProvider)?.toLowerCase();
    const subject = normalize(input.authSubject);
    const email = normalizeEmail(input.beneficiaryEmail);
    if (!provider) throw new Error("auth_provider is required");
    if (!subject) throw new Error("auth_subject is required");
    if (email && !EMAIL_PATTERN.test(email)) {
      throw new Error("beneficiary_email must be a valid email");
    }

    const state = await this.deps.store.readState();
    const session = this.requireSession(state, input.sessionId);
    this.ensureVerifiableSession(session, "oauth");

    if (session.authProvider !== provider) {
      throw new Error(
        `OAuth provider mismatch: expected ${session.authProvider || "unknown"}`
      );
    }
    if (!session.oauthStateToken) {
      throw new Error("OAuth session is missing oauth_state_token");
    }
    this.validateOauthStateToken(session, input.oauthStateToken);

    session.authSubject = subject;
    if (email) session.beneficiaryEmail = email;
    session.status = "verified";
    session.verifiedAt = this.deps.now().toISOString();
    await this.deps.store.writeState(state);

    return {
      session: stripSession(session),
      identity: this.buildIdentityFromSession(session),
    };
  }

  async getSession(sessionId: string): Promise<AuthSessionPublic | null> {
    const state = await this.deps.store.readState();
    const session = state.sessions.find((item) => item.id === sessionId);
    if (!session) return null;
    this.mutateSessionStatusForTime(session);
    await this.deps.store.writeState(state);
    return stripSession(session);
  }

  async linkSessionToUser(input: {
    sessionId: string;
    userId: string;
  }): Promise<IdentityLinkRecord> {
    const userId = normalize(input.userId);
    if (!userId) throw new Error("user_id is required");

    const state = await this.deps.store.readState();
    const session = this.requireSession(state, input.sessionId);
    this.mutateSessionStatusForTime(session);
    if (session.status !== "verified") {
      throw new Error("Auth session must be verified before linking");
    }

    const existing = state.links.find((item) => item.userId === userId);
    const linked: IdentityLinkRecord = {
      userId,
      sessionId: session.id,
      method: session.method,
      beneficiaryEmail: session.beneficiaryEmail,
      authProvider: session.authProvider,
      authSubject: session.authSubject,
      linkedAt: this.deps.now().toISOString(),
    };

    if (existing) {
      Object.assign(existing, linked);
    } else {
      state.links.push(linked);
    }
    await this.deps.store.writeState(state);
    return linked;
  }

  async startRecovery(input: {
    beneficiaryEmail: string;
  }): Promise<StartRecoveryResult> {
    const email = normalizeEmail(input.beneficiaryEmail);
    if (!email || !EMAIL_PATTERN.test(email)) {
      throw new Error("beneficiary_email must be a valid email");
    }

    const state = await this.deps.store.readState();
    const verifiedSessions = state.sessions
      .filter(
        (item) =>
          item.status === "verified" && item.beneficiaryEmail?.toLowerCase() === email
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const source = verifiedSessions[0];
    if (!source) {
      throw new Error("No verified auth session found for this email");
    }

    const now = this.deps.now();
    const recoveryToken = `recover_${randomUUID().replace(/-/g, "")}`;
    const record: RecoveryTokenRecord = {
      id: this.recoveryId(),
      tokenHash: this.hash(recoveryToken),
      sessionId: source.id,
      beneficiaryEmail: email,
      createdAt: now.toISOString(),
      expiresAt: toIsoDate(now, this.deps.recoveryTtlSeconds),
    };

    state.recoveries.push(record);
    await this.deps.store.writeState(state);

    return {
      recoveryToken,
      expiresAt: record.expiresAt,
      sessionId: source.id,
    };
  }

  async recoverWithToken(input: {
    recoveryToken: string;
  }): Promise<RecoverIdentityResult> {
    const token = normalize(input.recoveryToken);
    if (!token) throw new Error("recovery_token is required");

    const state = await this.deps.store.readState();
    const recovery = state.recoveries.find((item) =>
      safeEquals(item.tokenHash, this.hash(token))
    );
    if (!recovery) throw new Error("Invalid recovery_token");
    if (recovery.consumedAt) throw new Error("recovery_token has already been used");
    if (isExpired(this.deps.now(), recovery.expiresAt)) {
      throw new Error("recovery_token is expired");
    }

    const source = this.requireSession(state, recovery.sessionId);
    if (source.status !== "verified") {
      throw new Error("Recovery source session is not verified");
    }

    const now = this.deps.now();
    const recovered: AuthSessionRecord = {
      id: this.sessionId(),
      method: source.method,
      status: "verified",
      createdAt: now.toISOString(),
      expiresAt: toIsoDate(now, this.deps.sessionTtlSeconds),
      verifiedAt: now.toISOString(),
      beneficiaryName: source.beneficiaryName,
      beneficiaryEmail: source.beneficiaryEmail,
      authProvider: source.authProvider,
      authSubject: source.authSubject,
      verificationAttempts: 0,
      maxVerificationAttempts: this.deps.maxVerificationAttempts,
    };
    recovery.consumedAt = now.toISOString();
    state.sessions.push(recovered);
    await this.deps.store.writeState(state);

    return { session: stripSession(recovered) };
  }

  async resolveVerifiedIdentity(sessionId: string): Promise<IdentityAttribution> {
    const state = await this.deps.store.readState();
    const session = this.requireSession(state, sessionId);
    this.mutateSessionStatusForTime(session);
    await this.deps.store.writeState(state);
    if (session.status !== "verified") {
      throw new Error("auth_session_id is not verified");
    }
    return this.buildIdentityFromSession(session);
  }
}
