import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { jwt } from "better-auth/plugins/jwt";
import { importPKCS8, SignJWT } from "jose";
import { Pool } from "pg";

const authBaseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

function requireEnvironmentVariable(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function generateAppleClientSecret(
  clientId = requireEnvironmentVariable("APPLE_CLIENT_ID"),
) {
  const teamId = requireEnvironmentVariable("APPLE_TEAM_ID");
  const keyId = requireEnvironmentVariable("APPLE_KEY_ID");
  const privateKey = requireEnvironmentVariable("APPLE_PRIVATE_KEY").replace(
    /\\n/g,
    "\n",
  );
  const signingKey = await importPKCS8(privateKey, "ES256");
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setIssuer(teamId)
    .setSubject(clientId)
    .setAudience("https://appleid.apple.com")
    .setIssuedAt(now)
    .setExpirationTime(now + 180 * 24 * 60 * 60)
    .sign(signingKey);
}

function appleSocialProvider() {
  const names = [
    "APPLE_CLIENT_ID",
    "APPLE_TEAM_ID",
    "APPLE_KEY_ID",
    "APPLE_PRIVATE_KEY",
  ] as const;
  const configured = names.filter((name) => process.env[name]);

  if (!configured.length) {
    console.warn(
      "Sign in with Apple is disabled because Apple credentials are not configured.",
    );
    return {};
  }
  if (configured.length !== names.length) {
    const missing = names.filter((name) => !process.env[name]);
    throw new Error(
      `Incomplete Sign in with Apple configuration: ${missing.join(", ")}`,
    );
  }

  return {
    apple: async () => ({
      appBundleIdentifier: "com.phaseroll.phaseroll",
      clientId: requireEnvironmentVariable("APPLE_CLIENT_ID"),
      clientSecret: await generateAppleClientSecret(),
      disableImplicitSignUp: true,
    }),
  };
}

async function accountDeletionRequest(
  action: "finalize" | "gate",
  userId: string,
) {
  const apiBaseUrl = requireEnvironmentVariable(
    "PHASEROLL_API_BASE_URL",
  ).replace(/\/$/, "");
  const serviceToken = requireEnvironmentVariable(
    "PHASEROLL_ACCOUNT_DELETION_SERVICE_TOKEN",
  );
  return fetch(`${apiBaseUrl}/internal/v1/account-deletions/${action}`, {
    body: JSON.stringify({ userId }),
    headers: {
      "Content-Type": "application/json",
      "X-Account-Deletion-Service-Token": serviceToken,
    },
    method: "POST",
  });
}

async function requireAccountDeletionReady(userId: string) {
  const response = await accountDeletionRequest("gate", userId);
  if (response.ok) return;
  if (response.status === 409) {
    throw new APIError("CONFLICT", {
      message: "Account data deletion is not ready to be finalized.",
    });
  }
  throw new APIError("INTERNAL_SERVER_ERROR", {
    message: "PhaseRoll could not verify account deletion readiness.",
  });
}

async function finalizeAccountDeletion(userId: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await accountDeletionRequest("finalize", userId);
      if (response.ok) return;
    } catch (error) {
      if (attempt === 4) throw error;
    }
    if (attempt < 4) {
      await new Promise((resolve) =>
        setTimeout(resolve, 250 * 2 ** attempt),
      );
    }
  }
  throw new APIError("INTERNAL_SERVER_ERROR", {
    message: "PhaseRoll could not finalize account deletion.",
  });
}

const database = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: process.env.POSTGRES_SSL === "true" ? true : undefined,
});

export async function verifyAndRevokeAppleAuthorization(
  userId: string,
  authorizationCode: string,
) {
  const nativeClientId = "com.phaseroll.phaseroll";
  const clientSecret = await generateAppleClientSecret(nativeClientId);
  const tokenResponse = await fetch("https://appleid.apple.com/auth/token", {
    body: new URLSearchParams({
      client_id: nativeClientId,
      client_secret: clientSecret,
      code: authorizationCode,
      grant_type: "authorization_code",
    }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });
  if (!tokenResponse.ok) {
    throw new Error("Apple authorization could not be verified.");
  }

  const tokens = (await tokenResponse.json()) as {
    access_token?: string;
    id_token?: string;
    refresh_token?: string;
  };
  const encodedPayload = tokens.id_token?.split(".")[1];
  if (!encodedPayload) throw new Error("Apple did not return an identity token.");
  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8"),
  ) as { sub?: unknown };
  if (typeof payload.sub !== "string") {
    throw new Error("Apple returned an invalid identity token.");
  }

  const account = await database.query(
    `SELECT 1
       FROM account
      WHERE "userId" = $1
        AND "providerId" = 'apple'
        AND "accountId" = $2
      LIMIT 1`,
    [userId, payload.sub],
  );
  if (account.rowCount !== 1) {
    throw new Error("Sign in with the same Apple account you want to delete.");
  }

  const token = tokens.refresh_token ?? tokens.access_token;
  if (!token) throw new Error("Apple did not return a revocable token.");
  const revokeResponse = await fetch("https://appleid.apple.com/auth/revoke", {
    body: new URLSearchParams({
      client_id: nativeClientId,
      client_secret: clientSecret,
      token,
      token_type_hint: tokens.refresh_token
        ? "refresh_token"
        : "access_token",
    }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });
  if (!revokeResponse.ok) {
    throw new Error("Apple authorization could not be revoked.");
  }
}

export const auth = betterAuth({
  advanced: {
    cookiePrefix: "better-auth",
  },
  appName: "PhaseRoll",
  baseURL: authBaseURL,
  database,
  socialProviders: {
    ...appleSocialProvider(),
    google: {
      clientId:
        process.env.GOOGLE_CLIENT_ID ??
        process.env.GOOGLE_WEB_CLIENT_ID ??
        "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      disableImplicitSignUp: true,
      prompt: "select_account",
    },
  },
  user: {
    deleteUser: {
      afterDelete: (user) => finalizeAccountDeletion(user.id),
      beforeDelete: (user) => requireAccountDeletionReady(user.id),
      enabled: true,
    },
  },
  trustedOrigins: [
    "https://appleid.apple.com",
    "https://www.phaseroll.com",
    "phaseroll://",
    "phaseroll://*",
    ...(process.env.NODE_ENV === "development" ? ["exp://", "exp://**"] : []),
  ],
  plugins: [
    expo(),
    jwt({
      jwks: {
        keyPairConfig: { alg: "RS256", modulusLength: 2048 },
      },
      jwt: {
        audience: process.env.JWT_AUDIENCE ?? "phaseroll-api",
        issuer: authBaseURL,
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
