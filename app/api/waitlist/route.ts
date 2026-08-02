const EMAIL_PATTERN =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;

const MAX_EMAIL_LENGTH = 254;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const UPSTREAM_TIMEOUT_MS = 8000;

const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();

  for (const [key, entry] of hits) {
    if (entry.resetAt <= now) hits.delete(key);
  }

  const entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function fail(status: number) {
  return Response.json({ ok: false }, { status });
}

export async function POST(request: Request) {
  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  const sharedSecret = process.env.SHARED_SECRET;

  if (!appsScriptUrl || !sharedSecret) {
    console.error("waitlist: APPS_SCRIPT_URL or SHARED_SECRET is not set");
    return fail(500);
  }

  if (rateLimited(clientIp(request))) return fail(429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400);
  }

  if (typeof body !== "object" || body === null) return fail(400);
  const { email, company, source } = body as Record<string, unknown>;

  // Honeypot: any value at all means a bot filled it in.
  if (typeof company === "string" && company.trim() !== "") {
    return Response.json({ ok: true });
  }

  if (
    typeof email !== "string" ||
    email.length > MAX_EMAIL_LENGTH ||
    !EMAIL_PATTERN.test(email)
  ) {
    return fail(400);
  }

  try {
    const upstream = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: sharedSecret,
        email,
        source: typeof source === "string" ? source.slice(0, 64) : "landing",
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      redirect: "follow",
    });

    if (!upstream.ok) {
      console.error("waitlist: upstream responded", upstream.status);
      return fail(502);
    }

    const result = (await upstream.json()) as { ok?: boolean };
    if (!result.ok) return fail(502);
  } catch (error) {
    console.error("waitlist: upstream request failed", error);
    return fail(502);
  }

  return Response.json({ ok: true });
}
