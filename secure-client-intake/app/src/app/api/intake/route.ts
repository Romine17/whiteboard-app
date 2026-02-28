import { NextResponse } from "next/server";
import { intakeSchema } from "@/lib/schema";

function mask(value: string | undefined, visible = 4) {
  if (!value) return value;
  if (value.length <= visible) return "*".repeat(value.length);
  return "*".repeat(value.length - visible) + value.slice(-visible);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = intakeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });
    }

    // TODO: replace with KMS envelope encryption and DB persistence.
    // Intentionally only returning masked sensitive values here.
    const safeEcho = {
      ...parsed.data,
      taxpayerSsn: mask(parsed.data.taxpayerSsn),
      spouseSsn: mask(parsed.data.spouseSsn),
      bankAccountNumber: mask(parsed.data.bankAccountNumber),
      bankRoutingNumber: mask(parsed.data.bankRoutingNumber),
    };

    return NextResponse.json({ ok: true, message: "Intake received", data: safeEcho }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
