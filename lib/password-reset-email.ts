export async function sendPasswordResetEmail(email: string, url: string) {
  const apiKey = process.env.PHASEROLL_RESEND_API_KEY;
  const from = process.env.PHASEROLL_RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error("Password recovery email delivery is not configured.");
    throw new Error("Password recovery email delivery is not configured.");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Reset your PhaseRoll password",
      text: `Someone requested a new password for your PhaseRoll account.\n\nReset your password: ${url}\n\nThis link expires in one hour. If this was not you, ignore this email. Your password has not changed.`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    console.error("Password recovery email delivery failed.", { status: response.status });
    throw new Error("Password recovery email delivery failed.");
  }
}
