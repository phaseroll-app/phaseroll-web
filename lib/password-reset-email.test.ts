import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';

import { sendPasswordResetEmail } from './password-reset-email';

function mailEnvironment(t: TestContext) {
  const names = ['PHASEROLL_RESEND_API_KEY', 'PHASEROLL_RESEND_FROM_EMAIL'] as const;
  const previous = names.map((name) => process.env[name]);
  process.env.PHASEROLL_RESEND_API_KEY = 'test-api-key';
  process.env.PHASEROLL_RESEND_FROM_EMAIL = 'PhaseRoll <test@example.test>';
  t.after(() => names.forEach((name, i) => {
    if (previous[i] === undefined) delete process.env[name];
    else process.env[name] = previous[i];
  }));
}

test('recovery delivery uses server-only configuration and the generated reset URL', async (t) => {
  mailEnvironment(t);
  const mock = t.mock.method(globalThis, 'fetch', async () => Response.json({ id: 'test-email' }));
  await sendPasswordResetEmail('user@example.test', 'https://auth.example.test/reset-password/test-token');
  const [url, options] = mock.mock.calls[0].arguments;
  assert.equal(url, 'https://api.resend.com/emails');
  assert.equal(options?.method, 'POST');
  assert.deepEqual(JSON.parse(String(options?.body)), {
    from: 'PhaseRoll <test@example.test>',
    to: ['user@example.test'],
    subject: 'Reset your PhaseRoll password',
    text: 'Someone requested a new password for your PhaseRoll account.\n\nReset your password: https://auth.example.test/reset-password/test-token\n\nThis link expires in one hour. If this was not you, ignore this email. Your password has not changed.',
  });
});

test('missing recovery configuration fails explicitly without sending anything', async (t) => {
  mailEnvironment(t);
  delete process.env.PHASEROLL_RESEND_API_KEY;
  const mock = t.mock.method(globalThis, 'fetch');
  const log = t.mock.method(console, 'error', () => {});
  await assert.rejects(sendPasswordResetEmail('user@example.test', 'test-url'), /not configured/);
  assert.equal(mock.mock.callCount(), 0);
  assert.equal(log.mock.callCount(), 1);
});

test('provider rejection is logged without including the email address or reset token', async (t) => {
  mailEnvironment(t);
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 429 }));
  const log = t.mock.method(console, 'error', () => {});
  await assert.rejects(sendPasswordResetEmail('user@example.test', 'secret-reset-url'), /delivery failed/);
  assert.deepEqual(log.mock.calls[0].arguments, ['Authentication email delivery failed.', { status: 429 }]);
});
