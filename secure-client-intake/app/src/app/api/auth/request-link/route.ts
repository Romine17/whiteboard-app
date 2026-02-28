import { NextResponse } from "next/server";
import { createMagicLink } from "../../../../lib/auth";
import { writeAudit } from "../../../../lib/audit";
import { getClientIp } from "../../../../lib/request";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { verifyTurnstile } from "../../../../lib/captcha";
import { sendMagicLinkEmail } from "../../../../lib/mailer";

export async function POST(req: Request) {
  try {
    const { email, captchaToken } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: false, message: "Valid email required" }, { status: 400 });
    }

    const ip = await getClientIp();
    const emailKey = `request-link:email:${email.toLowerCase()}`;
    const ipKey = `request-link:ip:${ip}`;

    const emailLimit = await checkRateLimit(emailKey, 3, 30);
    const ipLimit = await checkRateLimit(ipKey, 20, 30);
    if (!emailLimit.allowed || !ipLimit.allowed) {
      await writeAudit({
        actorType: "system",
        actorId: "api",
        action: "rate_limited",
        resourceType: "auth_request_link",
        resourceId: email.toLowerCase(),
        ip,
      });
      return NextResponse.json({ ok: false, message: "Too many attempts" }, { status: 429 });
    }

    const captcha = await verifyTurnstile(captchaToken);
    if (!captcha.ok) {
      return NextResponse.json({ ok: false, message: "Captcha verification failed" }, { status: 400 });
    }

    const token = await createMagicLink(email);
    const base = process.env.APP_BASE_URL || "http://localhost:3000";
    const link = `${base}/api/auth/verify?token=${encodeURIComponent(token)}`;

    const sent = await sendMagicLinkEmail(email, link);

    await writeAudit({
      actorType: "system",
      actorId: "api",
      action: "magic_link_created",
      resourceType: "intake_magic_link",
      resourceId: email.toLowerCase(),
      ip,
      metadata: { email: email.toLowerCase(), provider: sent.provider, sent: sent.ok },
    });

    if (!sent.ok) {
      return NextResponse.json({ ok: false, message: "Unable to send secure link" }, { status: 502 });
    }

    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ ok: true, message: "Magic link sent", devLink: link });
    }

    return NextResponse.json({ ok: true, message: "Magic link sent" });
  } catch {
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
