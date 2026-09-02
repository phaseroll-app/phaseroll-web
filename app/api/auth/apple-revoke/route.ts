import { auth, verifyAndRevokeAppleAuthorization } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response(null, { status: 401 });

  let body: unknown;
  try {
    body = (await request.json()) as unknown;
  } catch {
    return new Response(null, { status: 400 });
  }
  const authorizationCode =
    body && typeof body === "object" && "authorizationCode" in body
      ? body.authorizationCode
      : null;
  if (typeof authorizationCode !== "string" || !authorizationCode) {
    return new Response(null, { status: 400 });
  }

  try {
    await verifyAndRevokeAppleAuthorization(
      session.user.id,
      authorizationCode,
    );
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Apple deletion authorization failed.", error);
    return new Response(null, {
      status:
        error instanceof Error &&
        error.message ===
          "Sign in with the same Apple account you want to delete."
          ? 409
          : 502,
    });
  }
}
