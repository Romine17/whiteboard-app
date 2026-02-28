export async function verifyTurnstile(token?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true, skipped: true };
  if (!token) return { ok: false, reason: "missing_captcha" };

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });

  if (!res.ok) return { ok: false, reason: "captcha_http_error" };
  const json = (await res.json()) as { success?: boolean };
  return { ok: !!json.success, reason: json.success ? undefined : "captcha_failed" };
}
