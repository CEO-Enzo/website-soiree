import { readMessages } from "@/lib/messages";
import { spotifyGet } from "@/lib/spotify";
import { readRoulette } from "@/lib/roulette";

export async function getDashboardData() {
  // 🎶 Spotify (queue)
  let music = {
    current: null as null | { name: string; artist: string; image?: string | null },
    next: [] as { id: string; name: string; artist: string; image?: string | null }[],
  };

  // ⏱️ Spotify (player state)
  let player = {
    isPlaying: false,
    progressMs: 0,
    durationMs: 0,
  };

  try {
    const q = await spotifyGet("/me/player/queue");

    if (q?.currently_playing) {
      music.current = {
        name: q.currently_playing.name,
        artist: q.currently_playing.artists?.map((a: any) => a.name).join(", "),
        image:
          q.currently_playing.album?.images?.[0]?.url ||
          q.currently_playing.album?.images?.[1]?.url ||
          null,
      };
    }

    music.next =
      (q?.queue || []).slice(0, 10).map((t: any) => ({
        id: t.id,
        name: t.name,
        artist: t.artists?.map((a: any) => a.name).join(", "),
        image: t.album?.images?.[2]?.url || null,
      })) || [];
  } catch {}

  try {
    const p = await spotifyGet("/me/player");
    player = {
      isPlaying: !!p?.is_playing,
      progressMs: typeof p?.progress_ms === "number" ? p.progress_ms : 0,
      durationMs: typeof p?.item?.duration_ms === "number" ? p.item.duration_ms : 0,
    };
  } catch {}

  // 💬 Messages
  const messages = (await readMessages()).slice(0, 20);

  // 🎡 Roulette
  const roulette = await readRoulette();

  return { music, player, messages, roulette };
}
