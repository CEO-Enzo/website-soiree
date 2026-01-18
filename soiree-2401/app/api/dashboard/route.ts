import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard";

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json({ ok: true, ...data });
  } catch {
    return NextResponse.json({
      ok: false,
      music: { current: null, next: [] },
      player: { isPlaying: false, progressMs: 0, durationMs: 0 },
      messages: [],
      roulette: { participants: [], lastWinner: null, lastSpinAt: null, lastParticipants: [] },
    });
  }
}
