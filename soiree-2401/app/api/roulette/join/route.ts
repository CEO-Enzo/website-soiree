import { NextResponse } from "next/server";
import { addParticipant } from "@/lib/roulette";

const COOLDOWN_MS = 4000;
const ipLast = new Map<string, number>();

function getIP(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  try {
    const ip = getIP(req);
    const now = Date.now();
    const last = ipLast.get(ip) || 0;

    if (now - last < COOLDOWN_MS) {
      return NextResponse.json({ ok: false, error: "cooldown" }, { status: 429 });
    }
    ipLast.set(ip, now);

    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim();

    if (!name) {
      return NextResponse.json({ ok: false, error: "missing_name" }, { status: 400 });
    }

    const roulette = await addParticipant(name);
    return NextResponse.json({ ok: true, roulette });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
