import { NextResponse } from "next/server";
import { spotifyGet } from "@/lib/spotify";

export async function GET() {
  try {
      const data = await spotifyGet("/me/player/queue");

          const currently = data?.currently_playing
                ? {
                          name: data.currently_playing.name,
                                    artist: data.currently_playing.artists?.map((a: any) => a.name).join(", "),
                                              image:
                                                          data.currently_playing.album?.images?.[2]?.url ||
                                                                      data.currently_playing.album?.images?.[1]?.url ||
                                                                                  data.currently_playing.album?.images?.[0]?.url,
                                                                                          }
                                                                                                : null;

                                                                                                    const queue =
                                                                                                          (data?.queue || []).slice(0, 20).map((t: any) => ({
                                                                                                                  id: t.id,
                                                                                                                          name: t.name,
                                                                                                                                  artist: t.artists?.map((a: any) => a.name).join(", "),
                                                                                                                                          image: t.album?.images?.[2]?.url || t.album?.images?.[1]?.url || t.album?.images?.[0]?.url,
                                                                                                                                                })) || [];

                                                                                                                                                    return NextResponse.json({ ok: true, currently, queue });
                                                                                                                                                      } catch (e: any) {
                                                                                                                                                          console.error("queue-get error:", e);
                                                                                                                                                              return NextResponse.json({ ok: false, currently: null, queue: [] }, { status: 200 });
                                                                                                                                                                }
                                                                                                                                                                }
                                                                                                                                                                