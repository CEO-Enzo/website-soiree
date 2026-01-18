import { NextResponse } from "next/server";
import crypto from "crypto";
import { addMessage, readMessages, WallMessage } from "@/lib/messages";

const COOLDOWN_MS = 8000; // 8s par IP
const ipLastPost = new Map<string, number>();

function getIP(req: Request) {
  // Vercel/Proxy/CDN compat
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim();
  return "unknown";
}

export async function GET() {
  const messages = await readMessages();
  return NextResponse.json({ ok: true, messages });
}

export async function POST(req: Request) {
  try {
    const ip = getIP(req);
    const now = Date.now();
    const last = ipLastPost.get(ip) || 0;
    if (now - last < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - (now - last)) / 1000);
      return NextResponse.json(
        { ok: false, error: `Doucement 😄 réessaie dans ${wait}s` },
        { status: 200 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim().slice(0, 24);
    const text = String(body?.text || "").trim().slice(0, 240);

    if (!text) {
      return NextResponse.json({ ok: false, error: "Message vide" }, { status: 200 });
    }

    const msg: WallMessage = {
      id: crypto.randomBytes(8).toString("hex"),
      name: name || "Anonyme",
      text,
      createdAt: Date.now(),
    };

    await addMessage(msg);
    ipLastPost.set(ip, now);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("messages post error:", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 200 });
  }
}
