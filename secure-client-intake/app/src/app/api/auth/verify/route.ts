import { NextResponse } from "next/server";
import { consumeMagicLink, createSession } from "../../../../lib/auth";
import { writeAudit } from "../../../../lib/audit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || "";
    if (!token) {
      return NextResponse.json({ ok: false, message: "Missing token" }, { status: 400 });
    }

    const record = await consumeMagicLink(token);
    if (!record) {
      return NextResponse.json({ ok: false, message: "Invalid or expired token" }, { status: 401 });
    }

    await createSession(record.email);
    await writeAudit({
      actorType: "client",
      actorId: record.email,
      action: "magic_link_verified",
      resourceType: "intake_session",
      resourceId: record.id,
    });

    return NextResponse.redirect(new URL("/intake", req.url));
  } catch {
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
