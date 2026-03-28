import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, token } = await req.json();
    if (!email || !token) {
      return NextResponse.json({ error: "Missing email or token" }, { status: 400 });
    }

    const db = getDb();

    // Upsert push token — one token per email (overwrite on re-register)
    await db
      .from("push_tokens")
      .upsert(
        { email: email.toLowerCase().trim(), token, updated_at: new Date().toISOString() },
        { onConflict: "email" }
      );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
