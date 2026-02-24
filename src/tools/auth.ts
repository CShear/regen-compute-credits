import { AuthSessionService } from "../services/auth/service.js";

const auth = new AuthSessionService();

function optional(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export async function startIdentityAuthSessionTool(
  method: "email" | "oauth",
  beneficiaryEmail?: string,
  beneficiaryName?: string,
  authProvider?: string
) {
  try {
    if (method === "email") {
      if (!beneficiaryEmail?.trim()) {
        return {
          content: [
            {
              type: "text" as const,
              text: "beneficiary_email is required when method=email.",
            },
          ],
          isError: true,
        };
      }

      const started = await auth.startEmailAuth({
        beneficiaryEmail,
        beneficiaryName,
      });

      const lines = [
        "## Identity Auth Session Started",
        "",
        "| Field | Value |",
        "|-------|-------|",
        `| Method | email |`,
        `| Session ID | ${started.session.id} |`,
        `| Status | ${started.session.status} |`,
        `| Expires At | ${started.session.expiresAt} |`,
        `| Verification Code | ${started.verificationCode} |`,
        "",
        "Use `verify_identity_auth_session` with this session ID and verification code.",
      ];
      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }

    if (!authProvider?.trim()) {
      return {
        content: [
          {
            type: "text" as const,
            text: "auth_provider is required when method=oauth.",
          },
        ],
        isError: true,
      };
    }

    const started = await auth.startOAuthAuth({
      authProvider,
      beneficiaryEmail,
      beneficiaryName,
    });
    const lines = [
      "## Identity Auth Session Started",
      "",
      "| Field | Value |",
      "|-------|-------|",
      `| Method | oauth |`,
      `| Session ID | ${started.session.id} |`,
      `| Status | ${started.session.status} |`,
      `| Auth Provider | ${started.session.authProvider || "N/A"} |`,
      `| Expires At | ${started.session.expiresAt} |`,
      `| OAuth State Token | ${started.oauthStateToken} |`,
      "",
      "Complete OAuth externally, then call `verify_identity_auth_session` with session ID, oauth_state_token, auth_provider, and auth_subject.",
    ];
    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown auth start error";
    return {
      content: [
        { type: "text" as const, text: `Failed to start auth session: ${message}` },
      ],
      isError: true,
    };
  }
}

export async function verifyIdentityAuthSessionTool(input: {
  sessionId: string;
  method: "email" | "oauth";
  verificationCode?: string;
  oauthStateToken?: string;
  authProvider?: string;
  authSubject?: string;
  beneficiaryEmail?: string;
}) {
  try {
    let result;
    if (input.method === "email") {
      if (!input.verificationCode) {
        return {
          content: [
            {
              type: "text" as const,
              text: "verification_code is required for email session verification.",
            },
          ],
          isError: true,
        };
      }
      result = await auth.verifyEmailAuth({
        sessionId: input.sessionId,
        verificationCode: input.verificationCode,
      });
    } else {
      if (!input.oauthStateToken || !input.authProvider || !input.authSubject) {
        return {
          content: [
            {
              type: "text" as const,
              text:
                "oauth_state_token, auth_provider, and auth_subject are required for oauth session verification.",
            },
          ],
          isError: true,
        };
      }
      result = await auth.verifyOAuthAuth({
        sessionId: input.sessionId,
        oauthStateToken: input.oauthStateToken,
        authProvider: input.authProvider,
        authSubject: input.authSubject,
        beneficiaryEmail: input.beneficiaryEmail,
      });
    }

    const lines = [
      "## Identity Auth Session Verified",
      "",
      "| Field | Value |",
      "|-------|-------|",
      `| Session ID | ${result.session.id} |`,
      `| Method | ${result.session.method} |`,
      `| Status | ${result.session.status} |`,
      `| Beneficiary Email | ${result.identity.beneficiaryEmail || "N/A"} |`,
      `| Auth Provider | ${result.identity.authProvider || "N/A"} |`,
      `| Auth Subject | ${result.identity.authSubject || "N/A"} |`,
      "",
      "You can now pass this `auth_session_id` to `retire_credits`.",
    ];
    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown auth verify error";
    return {
      content: [
        { type: "text" as const, text: `Failed to verify auth session: ${message}` },
      ],
      isError: true,
    };
  }
}

export async function getIdentityAuthSessionTool(sessionId: string) {
  try {
    const session = await auth.getSession(sessionId);
    if (!session) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No auth session found for session_id=${sessionId}.`,
          },
        ],
      };
    }

    const lines = [
      "## Identity Auth Session",
      "",
      "| Field | Value |",
      "|-------|-------|",
      `| Session ID | ${session.id} |`,
      `| Method | ${session.method} |`,
      `| Status | ${session.status} |`,
      `| Created At | ${session.createdAt} |`,
      `| Expires At | ${session.expiresAt} |`,
      `| Verified At | ${session.verifiedAt || "N/A"} |`,
      `| Beneficiary Email | ${session.beneficiaryEmail || "N/A"} |`,
      `| Auth Provider | ${session.authProvider || "N/A"} |`,
      `| Auth Subject | ${session.authSubject || "N/A"} |`,
      `| Attempts | ${session.verificationAttempts}/${session.maxVerificationAttempts} |`,
    ];

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown auth status error";
    return {
      content: [
        { type: "text" as const, text: `Failed to get auth session: ${message}` },
      ],
      isError: true,
    };
  }
}

export async function linkIdentitySessionTool(sessionId: string, userId: string) {
  try {
    const link = await auth.linkSessionToUser({
      sessionId: optional(sessionId) || "",
      userId: optional(userId) || "",
    });

    const lines = [
      "## Identity Session Linked",
      "",
      "| Field | Value |",
      "|-------|-------|",
      `| User ID | ${link.userId} |`,
      `| Session ID | ${link.sessionId} |`,
      `| Method | ${link.method} |`,
      `| Beneficiary Email | ${link.beneficiaryEmail || "N/A"} |`,
      `| Auth Provider | ${link.authProvider || "N/A"} |`,
      `| Auth Subject | ${link.authSubject || "N/A"} |`,
      `| Linked At | ${link.linkedAt} |`,
    ];
    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown identity link error";
    return {
      content: [
        { type: "text" as const, text: `Failed to link identity session: ${message}` },
      ],
      isError: true,
    };
  }
}

export async function recoverIdentitySessionTool(
  action: "start" | "complete",
  beneficiaryEmail?: string,
  recoveryToken?: string
) {
  try {
    if (action === "start") {
      if (!beneficiaryEmail?.trim()) {
        return {
          content: [
            {
              type: "text" as const,
              text: "beneficiary_email is required when action=start.",
            },
          ],
          isError: true,
        };
      }
      const result = await auth.startRecovery({ beneficiaryEmail });
      const lines = [
        "## Identity Recovery Started",
        "",
        "| Field | Value |",
        "|-------|-------|",
        `| Session ID | ${result.sessionId} |`,
        `| Recovery Token | ${result.recoveryToken} |`,
        `| Expires At | ${result.expiresAt} |`,
        "",
        "Use `recover_identity_session` with action=complete and recovery_token to mint a fresh verified auth session.",
      ];
      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }

    if (!recoveryToken?.trim()) {
      return {
        content: [
          {
            type: "text" as const,
            text: "recovery_token is required when action=complete.",
          },
        ],
        isError: true,
      };
    }

    const result = await auth.recoverWithToken({
      recoveryToken,
    });
    const lines = [
      "## Identity Recovery Complete",
      "",
      "| Field | Value |",
      "|-------|-------|",
      `| New Session ID | ${result.session.id} |`,
      `| Status | ${result.session.status} |`,
      `| Method | ${result.session.method} |`,
      `| Beneficiary Email | ${result.session.beneficiaryEmail || "N/A"} |`,
      `| Auth Provider | ${result.session.authProvider || "N/A"} |`,
      `| Auth Subject | ${result.session.authSubject || "N/A"} |`,
      `| Expires At | ${result.session.expiresAt} |`,
      "",
      "You can now use this new verified session in `retire_credits` via `auth_session_id`.",
    ];
    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown identity recovery error";
    return {
      content: [
        {
          type: "text" as const,
          text: `Failed to recover identity session: ${message}`,
        },
      ],
      isError: true,
    };
  }
}
