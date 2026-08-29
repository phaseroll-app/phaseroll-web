import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { jwt } from "better-auth/plugins/jwt";
import { importPKCS8, SignJWT } from "jose";
import { Pool } from "pg";

const authBaseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

function requireAppleEnvironmentVariable(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function generateAppleClientSecret() {
  const clientId = requireAppleEnvironmentVariable("APPLE_CLIENT_ID");
  const teamId = requireAppleEnvironmentVariable("APPLE_TEAM_ID");
  const keyId = requireAppleEnvironmentVariable("APPLE_KEY_ID");
  const privateKey = requireAppleEnvironmentVariable("APPLE_PRIVATE_KEY").replace(
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
      clientId: requireAppleEnvironmentVariable("APPLE_CLIENT_ID"),
      clientSecret: await generateAppleClientSecret(),
    }),
  };
}

function requireAccountDeletionEnvironmentVariable(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function accountDeletionRequest(
  action: "finalize" | "gate",
  userId: string,
) {
  const apiBaseUrl = requireAccountDeletionEnvironmentVariable(
    "PHASEROLL_API_BASE_URL",
  ).replace(/\/$/, "");
  const serviceToken = requireAccountDeletionEnvironmentVariable(
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
    const response = await accountDeletionRequest("finalize", userId);
    if (response.ok) return;
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

export const auth = betterAuth({
  appName: "PhaseRoll",
  database,
  socialProviders: {
    ...appleSocialProvider(),
    google: {
      clientId:
        process.env.GOOGLE_CLIENT_ID ??
        process.env.GOOGLE_WEB_CLIENT_ID ??
        "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
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
    ...(process.env.NODE_ENV === 'development' ? ['exp://', 'exp://**'] : []),
  ],
  plugins: [
    expo(),
    jwt({
      jwks: {
        keyPairConfig: { alg: "RS256", modulusLength: 2048 },
      },
      jwt: {
        audience: process.env.JWT_AUDIENCE ?? "",
        issuer: authBaseURL,
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;