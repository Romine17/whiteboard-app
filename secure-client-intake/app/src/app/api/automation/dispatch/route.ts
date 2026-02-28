import { NextResponse } from "next/server";
import { q } from "../../../../lib/db";
import { buildMappedPayload } from "../../../../lib/automation-map";
import { writeAudit } from "../../../../lib/audit";

export async function POST(req: Request) {
  try {
    const { submissionId } = await req.json();
    if (!submissionId) return NextResponse.json({ ok: false, message: "submissionId required" }, { status: 400 });

    const rows = await q<{ email: string; payload_json: Record<string, unknown> }>(
      `select email, payload_json from intake_submissions where id = $1 limit 1`,
      [submissionId]
    );

    const row = rows[0];
    if (!row) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });

    const mapped = buildMappedPayload(row.payload_json || {});
    const webhook = process.env.DOWNSTREAM_AUTOMATION_WEBHOOK;
    if (!webhook) {
      return NextResponse.json({ ok: false, message: "DOWNSTREAM_AUTOMATION_WEBHOOK not configured" }, { status: 500 });
    }

    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, email: row.email, mapped }),
    });

    await writeAudit({
      actorType: "system",
      actorId: "automation",
      action: "dispatch_attempt",
      resourceType: "intake_submission",
      resourceId: submissionId,
      metadata: { status: res.status },
    });

    if (!res.ok) return NextResponse.json({ ok: false, message: "Dispatch failed" }, { status: 502 });
    return NextResponse.json({ ok: true, message: "Dispatched", mapped });
  } catch {
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
