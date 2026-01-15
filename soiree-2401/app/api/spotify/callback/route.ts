import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TOKEN_URL = "https://accounts.spotify.com/api/token";

function basicAuth() {
  const raw = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  return Buffer.from(raw).toString("base64");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.refresh_token) {
    return NextResponse.json({ error: "Token exchange failed" }, { status: 400 });
  }

  const tokenPath = path.join(
    process.cwd(),
    "storage",
    "spotify-refresh-token.txt"
  );

  fs.writeFileSync(tokenPath, data.refresh_token, "utf-8");

  return NextResponse.redirect(new URL("/musique", url.origin));
}
