import { NextResponse } from "next/server";
import { spotifyGet, spotifyPost } from "@/lib/spotify";

function extractTrackId(uri: string) {
  // uri attendu: spotify:track:<id>
  const parts = uri.split(":");
  return parts.length === 3 ? parts[2] : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const uri = String(body?.uri || "");

    if (!uri.startsWith("spotify:track:")) {
      return NextResponse.json({ ok: false, error: "URI invalide" }, { status: 400 });
    }

    const newId = extractTrackId(uri);
    if (!newId) {
      return NextResponse.json({ ok: false, error: "URI invalide" }, { status: 400 });
    }

    // ✅ Anti-duplication : check queue actuelle
    // Spotify renvoie { currently_playing, queue: [...] }
    const q = await spotifyGet("/me/player/queue");

    const currentlyId = q?.currently_playing?.id || null;
    const inQueue =
      Array.isArray(q?.queue) && q.queue.some((t: any) => String(t?.id || "") === newId);

    if (String(currentlyId || "") === newId || inQueue) {
      return NextResponse.json({
        ok: false,
        error: "Déjà dans la file d’attente 🎵",
      });
    }

    // ✅ Ajout queue
    await spotifyPost(`/me/player/queue?uri=${encodeURIComponent(uri)}`);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("queue error:", e);
    return NextResponse.json({
      ok: false,
      error: e?.message || "Erreur ajout",
    });
  }
}
