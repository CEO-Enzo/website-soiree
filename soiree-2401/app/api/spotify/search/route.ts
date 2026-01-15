import { NextResponse } from "next/server";
import { spotifyGet } from "@/lib/spotify";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json({ items: [] });
    }

    const data = await spotifyGet(
      `/search?type=track&limit=10&q=${encodeURIComponent(q)}`
    );

    const items =
      data?.tracks?.items?.map((t: any) => ({
        id: t.id,
        uri: t.uri,
        name: t.name,
        artist: t.artists.map((a: any) => a.name).join(", "),
        album: t.album.name,
        image: t.album.images?.[2]?.url,
      })) || [];

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Spotify search error", err);
    // 🔴 IMPORTANT : on renvoie TOUJOURS du JSON
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
