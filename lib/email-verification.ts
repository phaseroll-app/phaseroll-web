import type { BetterAuthOptions } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { emailOTP } from "better-auth/plugins/email-otp";

import { sendAuthEmail } from "./password-reset-email";

export function emailVerificationOptions(
  demoEmail = process.env.PHASEROLL_DEMO_ACCOUNT_EMAIL,
) {
  const reservedEmail = demoEmail?.trim().toLowerCase();
  if (reservedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reservedEmail)) {
    throw new Error("PHASEROLL_DEMO_ACCOUNT_EMAIL must be a valid email address.");
  }
  return {
    rateLimit: {
      enabled: true,
      storage: "database",
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (reservedEmail && user.email.toLowerCase() === reservedEmail) {
              throw new APIError("FORBIDDEN", {
                code: "RESERVED_DEMO_EMAIL",
                message: "This email is reserved for an existing review account.",
              });
            }
          },
        },
      },
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        // Verification OTPs must not silently introduce passwordless sign-in or reset.
        if (
          ctx.path === "/sign-in/email-otp" ||
          ctx.path === "/forget-password/email-otp" ||
          (ctx.path.startsWith("/email-otp/") &&
            !["/email-otp/send-verification-otp", "/email-otp/verify-email"].includes(ctx.path)) ||
          (ctx.path === "/email-otp/send-verification-otp" &&
            ctx.body?.type !== "email-verification")
        ) {
          throw new APIError("FORBIDDEN", { message: "Only email verification OTPs are enabled." });
        }
        if (
          ctx.path !== "/sign-in/email" || !reservedEmail ||
          typeof ctx.body?.email !== "string" ||
          ctx.body.email.trim().toLowerCase() !== reservedEmail ||
          typeof ctx.body.password !== "string"
        ) return;

        const existing = await ctx.context.internalAdapter.findUserByEmail(reservedEmail, {
          includeAccounts: true,
        });
        const credential = existing?.accounts.find((account) => account.providerId === "credential");
        if (!existing || existing.user.emailVerified || !credential?.password) return;
        const valid = await ctx.context.password.verify({
          hash: credential.password,
          password: ctx.body.password,
        });
        if (valid) {
          await ctx.context.internalAdapter.updateUser(existing.user.id, { emailVerified: true });
        }
      }),
    },
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 300,
        allowedAttempts: 3,
        storeOTP: "hashed",
        disableSignUp: true,
        overrideDefaultEmailVerification: true,
        rateLimit: { window: 60, max: 3 },
        async sendVerificationOTP({ email, otp, type }) {
          if (type !== "email-verification") {
            throw new Error("Only email verification OTPs are enabled.");
          }
          await sendAuthEmail(
            email,
            "Verify your PhaseRoll email",
            `Your PhaseRoll verification code is ${otp}.\n\nThis code expires in 5 minutes and can only be used once. If you did not request it, ignore this email.`,
          );
        },
      }),
    ],
  } satisfies BetterAuthOptions;
}
