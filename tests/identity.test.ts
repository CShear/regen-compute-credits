import { describe, expect, it } from "vitest";
import {
  appendIdentityToReason,
  captureIdentity,
  parseAttributedReason,
} from "../src/services/identity.js";

describe("identity attribution helpers", () => {
  it("captures normalized email attribution", () => {
    const identity = captureIdentity({
      beneficiaryName: " Alice ",
      beneficiaryEmail: "ALICE@Example.com ",
    });

    expect(identity).toEqual({
      authMethod: "email",
      beneficiaryName: "Alice",
      beneficiaryEmail: "alice@example.com",
    });
  });

  it("requires auth_provider and auth_subject together", () => {
    expect(() => captureIdentity({ authProvider: "google" })).toThrow(
      "auth_provider and auth_subject must be provided together"
    );

    expect(() => captureIdentity({ authSubject: "sub-123" })).toThrow(
      "auth_provider and auth_subject must be provided together"
    );
  });

  it("round-trips reason metadata with parseAttributedReason", () => {
    const withIdentity = appendIdentityToReason("Funding regenerative impact", {
      authMethod: "oauth",
      beneficiaryName: "Alice",
      beneficiaryEmail: "alice@example.com",
      authProvider: "google",
      authSubject: "sub-123",
    });

    const parsed = parseAttributedReason(withIdentity);
    expect(parsed.reasonText).toBe("Funding regenerative impact");
    expect(parsed.identity).toMatchObject({
      method: "oauth",
      name: "Alice",
      email: "alice@example.com",
      provider: "google",
      subject: "sub-123",
    });
  });

  it("returns unmodified reason text when no identity tag exists", () => {
    const parsed = parseAttributedReason("Plain reason text");
    expect(parsed.reasonText).toBe("Plain reason text");
    expect(parsed.identity).toBeUndefined();
  });
});
