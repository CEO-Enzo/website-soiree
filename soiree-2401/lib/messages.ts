import fs from "fs/promises";
import path from "path";

export type WallMessage = {
  id: string;
  name: string;      // pseudo ou "Anonyme"
  text: string;
  createdAt: number; // timestamp
};

const FILE_PATH = path.join(process.cwd(), "storage", "messages.json");
const MAX_MESSAGES = 200;

async function ensureFile() {
  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
    await fs.writeFile(FILE_PATH, "[]", "utf-8");
  }
}

export async function readMessages(): Promise<WallMessage[]> {
  await ensureFile();
  const raw = await fs.readFile(FILE_PATH, "utf-8");
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function addMessage(msg: WallMessage) {
  const messages = await readMessages();
  messages.unshift(msg); // newest first
  const trimmed = messages.slice(0, MAX_MESSAGES);
  await fs.writeFile(FILE_PATH, JSON.stringify(trimmed, null, 2), "utf-8");
}
