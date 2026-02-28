import { cookies } from "next/headers";
import { q } from "./db";
import { randomToken, sha256 } from "./crypto";

const SESSION_COOKIE = "rhw_intake_session";

export async function createMagicLink(email: string) {
  const token = randomToken(24);
  const tokenHash = sha256(token);
  const minutes = Number(process.env.MAGIC_LINK_EXP_MIN || 30);

  await q(
    `insert into intake_magic_links (email, token_hash, expires_at)
     values ($1,$2, now() + ($3::text || ' minutes')::interval)`,
    [email.toLowerCase(), tokenHash, String(minutes)]
  );

  return token;
}

export async function consumeMagicLink(token: string) {
  const tokenHash = sha256(token);
  const rows = await q<{ id: string; email: string }>(
    `update intake_magic_links
     set used_at = now()
     where token_hash = $1
       and used_at is null
       and expires_at > now()
     returning id, email`,
    [tokenHash]
  );
  return rows[0] || null;
}

export async function createSession(email: string) {
  const sessionToken = randomToken(32);
  const sessionHash = sha256(sessionToken);
  const hours = Number(process.env.SESSION_EXP_HOURS || 12);

  await q(
    `insert into intake_sessions (session_token_hash, email, expires_at)
     values ($1,$2, now() + ($3::text || ' hours')::interval)`,
    [sessionHash, email.toLowerCase(), String(hours)]
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: hours * 60 * 60,
  });
}

export async function requireIntakeSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  if (!session) return null;
  const hash = sha256(session);
  const rows = await q<{ email: string }>(
    `select email from intake_sessions where session_token_hash = $1 and expires_at > now() limit 1`,
    [hash]
  );
  return rows[0] || null;
}
