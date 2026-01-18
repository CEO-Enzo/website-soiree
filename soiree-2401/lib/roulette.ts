import fs from "fs/promises";
import path from "path";

export type RouletteData = {
  participants: string[];
  lastSpinAt: number | null;
};

const STORAGE_DIR = path.join(process.cwd(), "storage");
const ROULETTE_FILE = path.join(STORAGE_DIR, "roulette.json");
const PRESENTS_FILE = path.join(STORAGE_DIR, "presents.txt");

const DEFAULT: RouletteData = {
  participants: [],
  lastSpinAt: null,
};

async function ensureStorage() {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
}

export async function readRoulette(): Promise<RouletteData> {
  try {
    const raw = await fs.readFile(ROULETTE_FILE, "utf-8");
    const data = JSON.parse(raw);
    return { ...DEFAULT, ...data };
  } catch {
    await ensureStorage();
    await fs.writeFile(ROULETTE_FILE, JSON.stringify(DEFAULT, null, 2), "utf-8");
    return { ...DEFAULT };
  }
}

export async function writeRoulette(data: RouletteData) {
  await ensureStorage();
  await fs.writeFile(ROULETTE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function addParticipant(name: string) {
  const r = await readRoulette();
  const n = String(name || "").trim();
  if (!n) return r;

  if (!r.participants.includes(n)) {
    r.participants.push(n);
    await writeRoulette(r);
  }
  return r;
}

export async function readPresents(): Promise<string[]> {
  try {
    const raw = await fs.readFile(PRESENTS_FILE, "utf-8");
    return raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

// ✅ Spin visuel-only : on met juste à jour lastSpinAt
export async function spinRoulette() {
  const r = await readRoulette();
  r.lastSpinAt = Date.now();
  await writeRoulette(r);
  return r;
}
