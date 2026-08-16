import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { Pool } from "pg";

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
    google: {
      clientId:
        process.env.GOOGLE_CLIENT_ID ??
        process.env.GOOGLE_WEB_CLIENT_ID ??
        "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  trustedOrigins: [
    "https://www.phaseroll.com",
    "phaseroll://",
    "phaseroll://*",
    ...(process.env.NODE_ENV === 'development' ? ['exp://', 'exp://**'] : []),
  ],
  plugins: [expo()],
});

export type Session = typeof auth.$Infer.Session;