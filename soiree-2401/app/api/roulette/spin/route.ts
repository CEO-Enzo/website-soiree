import { NextResponse } from "next/server";
import { spinRoulette } from "@/lib/roulette";

export async function POST() {
  try {
    const result = await spinRoulette();
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
