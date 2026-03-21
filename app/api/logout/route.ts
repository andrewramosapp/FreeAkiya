import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/member";

export async function GET() {
  const res = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL ?? "https://cheapakiya.com"));
  res.cookies.delete(COOKIE_NAME);
  return res;
}
