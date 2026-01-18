import { NextResponse } from "next/server";
import { readRoulette } from "@/lib/roulette";

export async function GET() {
  const roulette = await readRoulette();
  return NextResponse.json({ ok: true, roulette });
}
