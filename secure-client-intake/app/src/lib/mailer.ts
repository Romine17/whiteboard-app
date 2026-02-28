type SendResult = { ok: boolean; provider: string; error?: string };

export async function sendMagicLinkEmail(to: string, link: string): Promise<SendResult> {
  const webhook = process.env.MAGIC_LINK_EMAIL_WEBHOOK;

  if (!webhook) {
    // dev fallback: no external send configured
    return { ok: true, provider: "dev-noop" };
  }

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to,
      subject: "Your Secure RHW Intake Link",
      body: `Use this secure link to complete your intake. This link will expire soon: ${link}`,
    }),
  });

  if (!res.ok) return { ok: false, provider: "webhook", error: `status_${res.status}` };
  return { ok: true, provider: "webhook" };
}
