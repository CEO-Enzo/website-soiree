import { NextResponse } from "next/server";
import { readPresents } from "@/lib/roulette";

export async function GET() {
  const names = await readPresents();
  return NextResponse.json({ ok: true, names });
}
