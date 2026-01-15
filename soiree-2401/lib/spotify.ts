import fs from "fs";
import path from "path";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1";

function basicAuth() {
  const raw = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  return Buffer.from(raw).toString("base64");
}

function getRefreshToken(): string {
  const tokenPath = path.join(
    process.cwd(),
    "storage",
    "spotify-refresh-token.txt"
  );

  if (!fs.existsSync(tokenPath)) {
    throw new Error("Spotify non connecté");
  }

  return fs.readFileSync(tokenPath, "utf-8").trim();
}

export async function getAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error_description || "Refresh token failed");
  }

  return data.access_token;
}

export async function spotifyGet(pathname: string) {
  const token = await getAccessToken();
  const res = await fetch(`${API}${pathname}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Spotify GET failed");
  return data;
}

export async function spotifyPost(pathname: string) {
  const token = await getAccessToken();
  const res = await fetch(`${API}${pathname}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 204) return;
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Spotify POST failed");
  return data;
}
