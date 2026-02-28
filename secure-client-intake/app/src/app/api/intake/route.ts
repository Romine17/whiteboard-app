import { NextResponse } from "next/server";
import { intakeSchema } from "../../../lib/schema";
import { encryptField } from "../../../lib/crypto";
import { q } from "../../../lib/db";
import { requireIntakeSession } from "../../../lib/auth";
import { writeAudit } from "../../../lib/audit";
import { getClientIp } from "../../../lib/request";
import { checkRateLimit } from "../../../lib/rate-limit";

function mask(value: string | undefined, visible = 4) {
  if (!value) return value;
  if (value.length <= visible) return "*".repeat(value.length);
  return "*".repeat(value.length - visible) + value.slice(-visible);
}

export async function POST(req: Request) {
  try {
    const session = await requireIntakeSession();
    if (!session) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const ip = await getClientIp();
    const submitLimit = await checkRateLimit(`intake-submit:ip:${ip}`, 30, 30);
    if (!submitLimit.allowed) {
      return NextResponse.json({ ok: false, message: "Too many submissions" }, { status: 429 });
    }

    const body = await req.json();
    const parsed = intakeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    const publicPayload = {
      ...data,
      taxpayerSsn: undefined,
      spouseSsn: undefined,
      bankAccountNumber: undefined,
      bankRoutingNumber: undefined,
    };

    const created = await q<{ id: string }>(
      `insert into intake_submissions (email, payload_json) values ($1,$2) returning id`,
      [session.email, JSON.stringify(publicPayload)]
    );

    const submissionId = created[0].id;
    const sensitiveEntries = [
      ["taxpayerSsn", data.taxpayerSsn],
      ["spouseSsn", data.spouseSsn],
      ["bankAccountNumber", data.bankAccountNumber],
      ["bankRoutingNumber", data.bankRoutingNumber],
    ].filter(([, value]) => !!value) as Array<[string, string]>;

    for (const [field, value] of sensitiveEntries) {
      const enc = encryptField(value);
      await q(
        `insert into sensitive_payloads (submission_id, field_name, iv, ciphertext, tag, alg, key_version)
         values ($1,$2,$3,$4,$5,$6,$7)`,
        [submissionId, field, enc.iv, enc.ciphertext, enc.tag, enc.alg, enc.keyVersion]
      );
    }

    await writeAudit({
      actorType: "client",
      actorId: session.email,
      action: "intake_submitted",
      resourceType: "intake_submission",
      resourceId: submissionId,
      ip,
    });

    const safeEcho = {
      ...publicPayload,
      taxpayerSsn: mask(data.taxpayerSsn),
      spouseSsn: mask(data.spouseSsn),
      bankAccountNumber: mask(data.bankAccountNumber),
      bankRoutingNumber: mask(data.bankRoutingNumber),
    };

    return NextResponse.json({ ok: true, message: "Intake received", id: submissionId, data: safeEcho });
  } catch {
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
