import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function cleanStr(v: unknown, max = 120) {
  const s = String(v ?? "").trim();
  return s.length > max ? s.slice(0, max) : s;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = cleanStr(body.name, 80);
    const phone = cleanStr(body.phone, 40);
    const note = cleanStr(body.note, 300);
    const status = cleanStr(body.status, 10);
    const guests = Number(body.guests ?? 1);

    if (!name) return NextResponse.json({ ok: false, error: "Nom requis." }, { status: 400 });
    if (!["yes", "maybe", "no"].includes(status)) {
      return NextResponse.json({ ok: false, error: "Statut invalide." }, { status: 400 });
    }
    if (!Number.isFinite(guests) || guests < 1 || guests > 6) {
      return NextResponse.json({ ok: false, error: "Invités: 1 à 6." }, { status: 400 });
    }

    await prisma.rsvp.create({
      data: {
        name,
        phone: phone || null,
        note: note || null,
        status,
        guests,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }
}
