/**
 * Identity attribution helpers for retirement certificates.
 *
 * We append a compact metadata tag to the on-chain retirement reason so
 * identity details can be recovered later from certificate queries.
 */

const IDENTITY_TAG_PATTERN = /\s*\[identity:([A-Za-z0-9\-_]+)\]\s*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthMethod = "none" | "manual" | "email" | "oauth";

export interface IdentityInput {
  beneficiaryName?: string;
  beneficiaryEmail?: string;
  authProvider?: string;
  authSubject?: string;
}

export interface IdentityAttribution {
  authMethod: AuthMethod;
  beneficiaryName?: string;
  beneficiaryEmail?: string;
  authProvider?: string;
  authSubject?: string;
}

interface EncodedIdentityV1 {
  v: 1;
  method: Exclude<AuthMethod, "none">;
  name?: string;
  email?: string;
  provider?: string;
  subject?: string;
}

export interface ParsedAttributedReason {
  reasonText: string;
  identity?: EncodedIdentityV1;
}

function normalize(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeEmail(value?: string | null): string | undefined {
  const email = normalize(value);
  if (!email) return undefined;
  return email.toLowerCase();
}

export function captureIdentity(input: IdentityInput): IdentityAttribution {
  const beneficiaryName = normalize(input.beneficiaryName);
  const beneficiaryEmail = normalizeEmail(input.beneficiaryEmail);
  const authProvider = normalize(input.authProvider);
  const authSubject = normalize(input.authSubject);

  if (beneficiaryEmail && !EMAIL_PATTERN.test(beneficiaryEmail)) {
    throw new Error("Invalid beneficiary_email format");
  }

  if ((authProvider && !authSubject) || (!authProvider && authSubject)) {
    throw new Error("auth_provider and auth_subject must be provided together");
  }

  if (authProvider && authSubject) {
    return {
      authMethod: "oauth",
      beneficiaryName,
      beneficiaryEmail,
      authProvider,
      authSubject,
    };
  }

  if (beneficiaryEmail) {
    return {
      authMethod: "email",
      beneficiaryName,
      beneficiaryEmail,
    };
  }

  if (beneficiaryName) {
    return {
      authMethod: "manual",
      beneficiaryName,
    };
  }

  return { authMethod: "none" };
}

export function appendIdentityToReason(
  baseReason: string,
  identity: IdentityAttribution
): string {
  if (identity.authMethod === "none") {
    return baseReason;
  }

  const payload: EncodedIdentityV1 = {
    v: 1,
    method: identity.authMethod,
  };

  if (identity.beneficiaryName) payload.name = identity.beneficiaryName;
  if (identity.beneficiaryEmail) payload.email = identity.beneficiaryEmail;
  if (identity.authProvider) payload.provider = identity.authProvider;
  if (identity.authSubject) payload.subject = identity.authSubject;

  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );

  return `${baseReason} [identity:${encoded}]`;
}

export function parseAttributedReason(
  reason?: string | null
): ParsedAttributedReason {
  const rawReason = normalize(reason) || "Ecological regeneration";
  const match = rawReason.match(IDENTITY_TAG_PATTERN);
  if (!match) {
    return { reasonText: rawReason };
  }

  const encoded = match[1];
  if (!encoded) {
    return { reasonText: rawReason };
  }

  try {
    const decoded = Buffer.from(encoded, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded) as Partial<EncodedIdentityV1>;

    if (
      parsed.v !== 1 ||
      !parsed.method ||
      !["manual", "email", "oauth"].includes(parsed.method)
    ) {
      return { reasonText: rawReason };
    }

    const reasonText = rawReason.replace(IDENTITY_TAG_PATTERN, "");
    return {
      reasonText: reasonText || "Ecological regeneration",
      identity: {
        v: 1,
        method: parsed.method,
        name: normalize(parsed.name),
        email: normalizeEmail(parsed.email),
        provider: normalize(parsed.provider),
        subject: normalize(parsed.subject),
      },
    };
  } catch {
    return { reasonText: rawReason };
  }
}
