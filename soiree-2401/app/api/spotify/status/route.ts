import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { spotifyGet } from "@/lib/spotify";

export async function GET() {
  const tokenPath = path.join(
    process.cwd(),
    "storage",
    "spotify-refresh-token.txt"
  );

  if (!fs.existsSync(tokenPath)) {
    return NextResponse.json({ connected: false });
  }

  try {
    const playback = await spotifyGet("/me/player");
    return NextResponse.json({
      connected: true,
      device: playback?.device?.name || null,
    });
  } catch {
    return NextResponse.json({
      connected: true,
      device: null,
    });
  }
}
