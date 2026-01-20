export const runtime = "nodejs";

import { isValidCategory, readData, readPresentPeople, writeData } from "@/lib/quiRameneStore";
import type { BringCategory } from "@/lib/quiRameneStore";

function isAdmin(body: any) {
  const code = String(body?.adminCode || "");
  return code.length > 0 && code === process.env.ADMIN_CODE;
}

export async function GET() {
  const data = await readData();
  const people = await readPresentPeople();
  return Response.json({ ...data, people, ok: true });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const label = String(body?.label || "").trim();
  const categoryRaw = body?.category;

  if (!label) return Response.json({ ok: false, error: "label required" }, { status: 400 });

  const category: BringCategory = isValidCategory(categoryRaw) ? categoryRaw : "Nourriture";

  const data = await readData();
  data.items.unshift({
    id: crypto.randomUUID(),
    label,
    category,
    assignedTo: "",
  });

  const saved = await writeData(data);
  const people = await readPresentPeople();
  return Response.json({ ...saved, people, ok: true });
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = String(body?.id || "");
  if (!id) return Response.json({ ok: false, error: "id required" }, { status: 400 });

  const data = await readData();
  const item = data.items.find((i) => i.id === id);
  if (!item) return Response.json({ ok: false, error: "not found" }, { status: 404 });

  // Tout le monde peut assigner/libérer
  if (typeof body.assignedTo === "string") item.assignedTo = body.assignedTo.trim();

  // Edition label/catégorie = ADMIN ONLY
  const wantsEditLabel = typeof body.label === "string";
  const wantsEditCat = typeof body.category === "string";

  if (wantsEditLabel || wantsEditCat) {
    if (!isAdmin(body)) return Response.json({ ok: false, error: "admin only" }, { status: 403 });

    if (wantsEditLabel) item.label = body.label.trim();
    if (wantsEditCat && isValidCategory(body.category)) item.category = body.category;
  }

  const saved = await writeData(data);
  const people = await readPresentPeople();
  return Response.json({ ...saved, people, ok: true });
}

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = String(body?.id || "");
  if (!id) return Response.json({ ok: false, error: "id required" }, { status: 400 });

  if (!isAdmin(body)) return Response.json({ ok: false, error: "admin only" }, { status: 403 });

  const data = await readData();
  data.items = data.items.filter((i) => i.id !== id);

  const saved = await writeData(data);
  const people = await readPresentPeople();
  return Response.json({ ...saved, people, ok: true });
}
