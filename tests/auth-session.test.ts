import { beforeEach, describe, expect, it } from "vitest";
import { AuthSessionService } from "../src/services/auth/service.js";
import type { AuthState, AuthStore } from "../src/services/auth/store.js";

class InMemoryAuthStore implements AuthStore {
  private state: AuthState = {
    version: 1,
    sessions: [],
    links: [],
    recoveries: [],
  };

  async readState(): Promise<AuthState> {
    return structuredClone(this.state);
  }

  async writeState(state: AuthState): Promise<void> {
    this.state = structuredClone(state);
  }
}

describe("AuthSessionService", () => {
  let store: InMemoryAuthStore;
  let now: Date;
  let service: AuthSessionService;

  const nowFn = () => new Date(now);
  const advanceSeconds = (seconds: number) => {
    now = new Date(now.getTime() + seconds * 1000);
  };

  beforeEach(() => {
    store = new InMemoryAuthStore();
    now = new Date("2026-02-24T00:00:00.000Z");
    service = new AuthSessionService({
      store,
      now: nowFn,
      secret: "unit-test-auth-secret",
      sessionTtlSeconds: 60,
      recoveryTtlSeconds: 300,
      maxVerificationAttempts: 2,
      allowedOauthProviders: ["google", "github"],
    });
  });

  it("starts and verifies an email auth session", async () => {
    const started = await service.startEmailAuth({
      beneficiaryEmail: "ALICE@Example.com",
      beneficiaryName: " Alice ",
    });

    expect(started.session.status).toBe("pending");
    expect(started.session.beneficiaryEmail).toBe("alice@example.com");
    expect(started.verificationCode).toMatch(/^\d{6}$/);

    const verified = await service.verifyEmailAuth({
      sessionId: started.session.id,
      verificationCode: started.verificationCode,
    });

    expect(verified.session.status).toBe("verified");
    expect(verified.identity).toMatchObject({
      authMethod: "email",
      beneficiaryName: "Alice",
      beneficiaryEmail: "alice@example.com",
    });

    const resolved = await service.resolveVerifiedIdentity(started.session.id);
    expect(resolved).toMatchObject({
      authMethod: "email",
      beneficiaryEmail: "alice@example.com",
    });
  });

  it("locks email session after max failed verification attempts", async () => {
    const started = await service.startEmailAuth({
      beneficiaryEmail: "alice@example.com",
    });
    const wrongCode =
      started.verificationCode === "000000" ? "999999" : "000000";

    await expect(
      service.verifyEmailAuth({
        sessionId: started.session.id,
        verificationCode: wrongCode,
      })
    ).rejects.toThrow("Invalid verification_code");

    await expect(
      service.verifyEmailAuth({
        sessionId: started.session.id,
        verificationCode: wrongCode,
      })
    ).rejects.toThrow("Invalid verification_code");

    const session = await service.getSession(started.session.id);
    expect(session?.status).toBe("locked");

    await expect(
      service.verifyEmailAuth({
        sessionId: started.session.id,
        verificationCode: started.verificationCode,
      })
    ).rejects.toThrow("Auth session is locked after too many failed attempts");
  });

  it("verifies oauth sessions with signed state token and provider allowlist", async () => {
    await expect(
      service.startOAuthAuth({
        authProvider: "discord",
      })
    ).rejects.toThrow("Unsupported auth_provider 'discord'");

    const started = await service.startOAuthAuth({
      authProvider: "google",
      beneficiaryEmail: "oauth@example.com",
      beneficiaryName: "OAuth User",
    });

    await expect(
      service.verifyOAuthAuth({
        sessionId: started.session.id,
        oauthStateToken: `${started.oauthStateToken}x`,
        authProvider: "google",
        authSubject: "google-sub-1",
      })
    ).rejects.toThrow("Invalid oauth_state_token signature");

    const verified = await service.verifyOAuthAuth({
      sessionId: started.session.id,
      oauthStateToken: started.oauthStateToken,
      authProvider: "google",
      authSubject: "google-sub-1",
    });

    expect(verified.session.status).toBe("verified");
    expect(verified.identity).toMatchObject({
      authMethod: "oauth",
      beneficiaryEmail: "oauth@example.com",
      authProvider: "google",
      authSubject: "google-sub-1",
    });
  });

  it("marks pending sessions as expired and blocks verification", async () => {
    const started = await service.startEmailAuth({
      beneficiaryEmail: "alice@example.com",
    });

    advanceSeconds(61);

    const session = await service.getSession(started.session.id);
    expect(session?.status).toBe("expired");

    await expect(
      service.verifyEmailAuth({
        sessionId: started.session.id,
        verificationCode: started.verificationCode,
      })
    ).rejects.toThrow("Auth session is expired");
  });

  it("supports recovery token flow and enforces single use", async () => {
    const started = await service.startEmailAuth({
      beneficiaryEmail: "alice@example.com",
      beneficiaryName: "Alice",
    });

    await service.verifyEmailAuth({
      sessionId: started.session.id,
      verificationCode: started.verificationCode,
    });

    const recovery = await service.startRecovery({
      beneficiaryEmail: "alice@example.com",
    });

    const recovered = await service.recoverWithToken({
      recoveryToken: recovery.recoveryToken,
    });

    expect(recovered.session.id).not.toBe(started.session.id);
    expect(recovered.session.status).toBe("verified");

    await expect(
      service.recoverWithToken({
        recoveryToken: recovery.recoveryToken,
      })
    ).rejects.toThrow("recovery_token has already been used");
  });

  it("links verified sessions to user IDs", async () => {
    const started = await service.startOAuthAuth({
      authProvider: "github",
      beneficiaryEmail: "dev@example.com",
    });

    await service.verifyOAuthAuth({
      sessionId: started.session.id,
      oauthStateToken: started.oauthStateToken,
      authProvider: "github",
      authSubject: "gh-123",
    });

    const linked = await service.linkSessionToUser({
      sessionId: started.session.id,
      userId: "user_123",
    });

    expect(linked).toMatchObject({
      userId: "user_123",
      sessionId: started.session.id,
      method: "oauth",
      authProvider: "github",
      authSubject: "gh-123",
      beneficiaryEmail: "dev@example.com",
    });
  });
});
