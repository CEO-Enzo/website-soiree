import fs from "fs/promises";
import path from "path";

export type BringCategory = "Softs" | "Alcool" | "Nourriture" | "Matériel";

export type QuiRameneItem = {
  id: string;
  label: string;
  category: BringCategory;
  assignedTo: string; // "" = libre
};

export type QuiRameneData = {
  items: QuiRameneItem[];
  updatedAt: number;
};

const STORAGE_DIR = path.join(process.cwd(), "storage");
const DATA_FILE = path.join(STORAGE_DIR, "qui-ramene.json");

// ton fichier est bien ici + avec un s
const PRESENT_CANDIDATES = [
  path.join(STORAGE_DIR, "presents.txt"),
  path.join(STORAGE_DIR, "present.txt"),
];

const ALLOWED_CATS: BringCategory[] = ["Softs", "Alcool", "Nourriture", "Matériel"];

function normalizeCategory(v: any): BringCategory {
  const s = String(v || "").trim();
  return (ALLOWED_CATS as string[]).includes(s) ? (s as BringCategory) : "Nourriture";
}

function defaultData(): QuiRameneData {
  return {
    items: [
      { id: crypto.randomUUID(), label: "Softs (coca, oasis...)", category: "Softs", assignedTo: "" },
      { id: crypto.randomUUID(), label: "Alcool (bières / bouteilles)", category: "Alcool", assignedTo: "" },
      { id: crypto.randomUUID(), label: "Nourriture (snacks, sucré/salé)", category: "Nourriture", assignedTo: "" },
      { id: crypto.randomUUID(), label: "Matériel (enceinte, multiprise…)", category: "Matériel", assignedTo: "" },
    ],
    updatedAt: Date.now(),
  };
}

async function atomicWrite(file: string, content: string) {
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, content, "utf-8");
  await fs.rename(tmp, file);
}

export async function writeData(data: QuiRameneData): Promise<QuiRameneData> {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  data.updatedAt = Date.now();
  await atomicWrite(DATA_FILE, JSON.stringify(data, null, 2));
  return data;
}

async function safeParseData(raw: string): Promise<QuiRameneData | null> {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed) as Partial<QuiRameneData>;
    if (!parsed || !Array.isArray(parsed.items)) return null;

    const items: QuiRameneItem[] = parsed.items.map((i: any) => ({
      id: String(i?.id || crypto.randomUUID()),
      label: String(i?.label || "").trim(),
      category: normalizeCategory(i?.category),
      assignedTo: String(i?.assignedTo || "").trim(),
    }));

    return {
      items,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

async function ensureStorage() {
  await fs.mkdir(STORAGE_DIR, { recursive: true });

  // si fichier absent → on le crée
  try {
    await fs.access(DATA_FILE);
  } catch {
    await writeData(defaultData());
    return;
  }

  // si fichier présent mais vide/cassé → backup + regen
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = await safeParseData(raw);
    if (!parsed) {
      const backup = path.join(STORAGE_DIR, `qui-ramene.bad.${Date.now()}.json`);
      await atomicWrite(backup, raw);
      await writeData(defaultData());
    }
  } catch {
    await writeData(defaultData());
  }
}

export async function readData(): Promise<QuiRameneData> {
  await ensureStorage();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  const parsed = await safeParseData(raw);
  if (parsed) return parsed;

  const fresh = defaultData();
  await writeData(fresh);
  return fresh;
}

export async function readPresentPeople(): Promise<string[]> {
  for (const file of PRESENT_CANDIDATES) {
    try {
      let raw = await fs.readFile(file, "utf-8");

      // retire BOM éventuel
      raw = raw.replace(/^\uFEFF/, "");

      const list = raw
        .split(/\r?\n/)
        .flatMap((line) => line.split(/[;,]/g))
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("#"));

      if (list.length > 0) return list;
    } catch {
      // try next
    }
  }

  return [];
}

export function isValidCategory(v: any): v is BringCategory {
  return (ALLOWED_CATS as string[]).includes(String(v));
}
