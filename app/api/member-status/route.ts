import { NextResponse } from "next/server";
import { getMemberEmail } from "@/lib/member";

export async function GET() {
  const email = await getMemberEmail();
  return NextResponse.json({ premium: !!email, email: email ?? null });
}
