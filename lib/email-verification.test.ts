import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";

import { emailVerificationOptions } from "./email-verification";

function fixture(t: TestContext) {
  const db: Record<string, Record<string, unknown>[]> = {
    user: [], account: [], session: [], verification: [], rateLimit: [],
  };
  const emails: { to: string[]; text: string; subject: string }[] = [];
  const previous = [process.env.PHASEROLL_RESEND_API_KEY, process.env.PHASEROLL_RESEND_FROM_EMAIL];
  process.env.PHASEROLL_RESEND_API_KEY = "test-only";
  process.env.PHASEROLL_RESEND_FROM_EMAIL = "PhaseRoll <sender@example.test>";
  t.after(() => {
    for (const [index, key] of ["PHASEROLL_RESEND_API_KEY", "PHASEROLL_RESEND_FROM_EMAIL"].entries()) {
      if (previous[index] === undefined) delete process.env[key];
      else process.env[key] = previous[index];
    }
  });
  t.mock.method(globalThis, "fetch", async (url: string | URL | Request, init?: RequestInit) => {
    assert.equal(url, "https://api.resend.com/emails");
    emails.push(JSON.parse(String(init?.body)));
    return Response.json({ id: "test-mail" });
  });
  let reservedEmail = "";
  function makeAuth() {
    return betterAuth({
      ...emailVerificationOptions(reservedEmail),
      baseURL: "http://localhost:3099",
      secret: "isolated-test-secret-at-least-thirty-two-characters",
      database: memoryAdapter(db),
      emailAndPassword: { enabled: true, requireEmailVerification: true },
    });
  }
  let auth = makeAuth();
  async function request(path: string, body: Record<string, unknown>, ip = "192.0.2.1") {
    const response = await auth.handler(new Request(`http://localhost:3099/api/auth${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost:3099", "x-forwarded-for": ip },
      body: JSON.stringify(body),
    }));
    return { response, body: await response.json() };
  }
  const credentials = (email = "user@example.test") => ({ email, name: "Test", password: "test-password-123" });
  function latestCode() {
    const match = emails.at(-1)?.text.match(/\b\d{6}\b/);
    assert.ok(match, "A six-digit code must be delivered");
    return match[0];
  }
  return {
    db, emails, request, credentials, latestCode,
    reserveDemo(email: string) { reservedEmail = email; auth = makeAuth(); },
  };
}

test("signup requires OTP; codes are hashed, single-use and create a verified session", async (t) => {
  const h = fixture(t);
  const signup = await h.request("/sign-up/email", h.credentials());
  assert.equal(signup.response.status, 200);
  assert.equal(signup.body.token, null);
  assert.equal(h.db.session.length, 0);
  assert.equal(h.db.user[0].emailVerified, false);
  const otp = h.latestCode();
  assert.ok(!JSON.stringify(h.db.verification).includes(otp));
  const verified = await h.request("/email-otp/verify-email", { email: h.credentials().email, otp });
  assert.equal(verified.response.status, 200);
  assert.equal(verified.body.user.emailVerified, true);
  assert.match(verified.response.headers.get("set-cookie") ?? "", /session_token/);
  assert.equal(h.db.user[0].emailVerified, true);
  const replay = await h.request("/email-otp/verify-email", { email: h.credentials().email, otp });
  assert.equal(replay.response.status, 400);
});

test("unverified password sign-in sends a fresh OTP; wrong passwords never send one", async (t) => {
  const h = fixture(t);
  await h.request("/sign-up/email", h.credentials());
  const wrong = await h.request("/sign-in/email", { ...h.credentials(), password: "wrong" });
  assert.equal(wrong.response.status, 401);
  assert.equal(h.emails.length, 1);
  const login = await h.request("/sign-in/email", h.credentials());
  assert.equal(login.body.code, "EMAIL_NOT_VERIFIED");
  assert.equal(h.emails.length, 2);
  assert.equal(h.db.session.length, 0);
});

test("expired codes and three failed attempts cannot verify; resend restores a new challenge", async (t) => {
  const h = fixture(t);
  await h.request("/sign-up/email", h.credentials());
  const expiredCode = h.latestCode();
  h.db.verification.forEach((row) => { row.expiresAt = new Date(Date.now() - 1000); });
  const expired = await h.request("/email-otp/verify-email", { email: h.credentials().email, otp: expiredCode });
  assert.equal(expired.response.status, 400);
  await h.request("/email-otp/send-verification-otp", { email: h.credentials().email, type: "email-verification" });
  const code = h.latestCode();
  const wrong = code === "000000" ? "111111" : "000000";
  for (let i = 0; i < 3; i++) {
    const invalid = await h.request("/email-otp/verify-email", { email: h.credentials().email, otp: wrong }, `192.0.2.${i + 10}`);
    assert.equal(invalid.response.status, 400);
  }
  const exhausted = await h.request("/email-otp/verify-email", { email: h.credentials().email, otp: code }, "192.0.2.20");
  assert.equal(exhausted.response.status, 403);
  assert.equal(h.db.user[0].emailVerified, false);
  await h.request("/email-otp/send-verification-otp", { email: h.credentials().email, type: "email-verification" });
  const verified = await h.request("/email-otp/verify-email", { email: h.credentials().email, otp: h.latestCode() }, "192.0.2.21");
  assert.equal(verified.response.status, 200);
});

test("OTP rate limits use shared database records across auth instances", async (t) => {
  const h = fixture(t);
  await h.request("/sign-up/email", h.credentials());
  for (let i = 0; i < 3; i++) {
    assert.equal((await h.request("/email-otp/send-verification-otp", { email: h.credentials().email, type: "email-verification" })).response.status, 200);
  }
  h.reserveDemo("demo@example.test");
  const limited = await h.request("/email-otp/send-verification-otp", { email: h.credentials().email, type: "email-verification" });
  assert.equal(limited.response.status, 429);
  assert.ok(h.db.rateLimit.length > 0);
});

test("only the existing reserved demo account with a correct password bypasses OTP", async (t) => {
  const h = fixture(t);
  await h.request("/sign-up/email", h.credentials("demo@example.test"));
  h.reserveDemo(" DEMO@EXAMPLE.TEST ");
  assert.equal((await h.request("/sign-in/email", { ...h.credentials("demo@example.test"), password: "wrong" })).response.status, 401);
  assert.equal(h.db.user[0].emailVerified, false);
  const login = await h.request("/sign-in/email", h.credentials("demo@example.test"));
  assert.equal(login.response.status, 200);
  assert.equal(login.body.user.emailVerified, true);
  assert.equal(h.emails.length, 1);

  h.reserveDemo("not-created@example.test");
  const signup = await h.request("/sign-up/email", h.credentials("not-created@example.test"));
  assert.equal(signup.response.status, 403);
  assert.equal(h.db.user.length, 1);
  const ordinary = await h.request("/sign-up/email", h.credentials("ordinary@example.test"), "192.0.2.22");
  assert.equal(ordinary.body.user.emailVerified, false);
});

test("passwordless OTP, OTP reset and non-verification delivery are not enabled", async (t) => {
  const h = fixture(t);
  for (const path of ["/sign-in/email-otp", "/email-otp/reset-password", "/email-otp/request-password-reset", "/email-otp/check-verification-otp"]) {
    assert.equal((await h.request(path, { email: "user@example.test", otp: "123456", password: "test-password" })).response.status, 403);
  }
  assert.equal((await h.request("/email-otp/send-verification-otp", { email: "user@example.test", type: "sign-in" })).response.status, 403);
  assert.equal(h.emails.length, 0);
});
