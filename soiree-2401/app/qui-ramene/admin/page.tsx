"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BringCategory = "Softs" | "Alcool" | "Nourriture" | "Matériel";

type BringItem = {
  id: string;
  label: string;
  category: BringCategory;
  assignedTo: string;
};

type ApiResponse = {
  ok?: boolean;
  items: BringItem[];
  updatedAt: number;
  people: string[];
  error?: string;
};

const CATS: BringCategory[] = ["Softs", "Alcool", "Nourriture", "Matériel"];

async function api(method: "GET" | "POST" | "PATCH" | "DELETE", body?: any): Promise<ApiResponse> {
  const res = await fetch("/api/qui-ramene", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as ApiResponse;
  if (!res.ok) throw new Error((data as any)?.error || "Erreur API");
  return data;
}

function catEmoji(c: BringCategory) {
  switch (c) {
    case "Softs":
      return "🥤";
    case "Alcool":
      return "🍺";
    case "Nourriture":
      return "🍕";
    case "Matériel":
      return "🔊";
  }
}

export default function QuiRameneAdminPage() {
  const [adminCode, setAdminCode] = useState("");
  const [items, setItems] = useState<BringItem[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const stats = useMemo(() => {
    const taken = items.filter((i) => i.assignedTo.trim().length > 0).length;
    return { taken, total: items.length, remaining: items.length - taken };
  }, [items]);

  async function load() {
    try {
      const data = await api("GET");
      setItems(data.items || []);
      setPeople(data.people || []);
    } catch {
      // silencieux
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  async function removeItem(id: string) {
    if (!confirm("Supprimer cet item ?")) return;

    setLoading(true);
    setInfo(null);
    try {
      await api("DELETE", { id, adminCode });
      await load();
      setInfo("Supprimé ✅");
    } catch (e: any) {
      setInfo(e?.message || "Erreur suppression");
    } finally {
      setLoading(false);
      setTimeout(() => setInfo(null), 1500);
    }
  }

  async function saveEdit(id: string, label: string, category: BringCategory) {
    setLoading(true);
    setInfo(null);
    try {
      await api("PATCH", { id, label, category, adminCode });
      await load();
      setInfo("Modifié ✅");
    } catch (e: any) {
      setInfo(e?.message || "Erreur modif");
    } finally {
      setLoading(false);
      setTimeout(() => setInfo(null), 1500);
    }
  }

  async function assignItem(id: string, assignedTo: string) {
    setLoading(true);
    setInfo(null);
    try {
      await api("PATCH", { id, assignedTo });
      await load();
      setInfo("OK ✅");
    } catch (e: any) {
      setInfo(e?.message || "Erreur attribution");
    } finally {
      setLoading(false);
      setTimeout(() => setInfo(null), 1200);
    }
  }

  return (
    <div className="bg">
      <div className="container">
        <nav>
          <Link className="btn" href="/">Accueil</Link>
          <Link className="btn" href="/infos">Infos</Link>
          <Link className="btn" href="/qui-ramene">Qui ramène ?</Link>
          <Link className="btn" href="/musique">Musique</Link>
          <Link className="btn" href="/messages">Messages</Link>
          <Link className="btn" href="/reglement">Règlement</Link>
        </nav>

        <div style={{ height: 18 }} />

        <div className="card">
          <h1 className="h1" style={{ fontSize: 34 }}>Admin — Qui ramène ?</h1>
          <p className="p">Suppression + édition (label / catégorie).</p>

          <div className="sep" />

          <div className="grid2">
            <div>
              <label className="label">Code admin</label>
              <input
                className="input"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="Ton code (env ADMIN_CODE)"
              />
              <div className="small" style={{ opacity: 0.7, marginTop: 8 }}>
                Si le code est faux : “admin only”.
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
              <span className="chip">✅ Pris : {stats.taken}/{stats.total}</span>
              <span className="chip">⏳ Restant : {stats.remaining}</span>
              <button className="btn" onClick={load} disabled={loading}>Rafraîchir</button>
              {info && <span className="small">{info}</span>}
            </div>
          </div>

          <div style={{ height: 14 }} />

          <div style={{ display: "grid", gap: 10 }}>
            {items.length === 0 ? (
              <div className="small" style={{ opacity: 0.8 }}>Aucun item.</div>
            ) : (
              items.map((it) => (
                <AdminRow
                  key={it.id}
                  it={it}
                  people={people}
                  loading={loading}
                  onAssign={assignItem}
                  onDelete={removeItem}
                  onSave={saveEdit}
                />
              ))
            )}
          </div>

          <div style={{ height: 12 }} />
          <div className="small" style={{ opacity: 0.75 }}>
            Tip : tu peux renommer “Alcool” → “Pack 24 bières”, etc.
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminRow(props: {
  it: BringItem;
  people: string[];
  loading: boolean;
  onAssign: (id: string, assignedTo: string) => void;
  onDelete: (id: string) => void;
  onSave: (id: string, label: string, category: BringCategory) => void;
}) {
  const { it, people, loading, onAssign, onDelete, onSave } = props;

  const [editLabel, setEditLabel] = useState(it.label);
  const [editCat, setEditCat] = useState<BringCategory>(it.category);

  const taken = it.assignedTo.trim().length > 0;

  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        {/* LEFT (amélioré) */}
        <div style={{ minWidth: 260 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 18, lineHeight: 1 }}>{catEmoji(it.category)}</div>
            <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: -0.2 }}>
              {it.label}
            </div>
          </div>

          <div
            className="small"
            style={{
              opacity: 0.85,
              marginTop: 8,
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span className="chip">{it.category}</span>
            <span style={{ opacity: 0.75 }}>•</span>
            {taken ? (
              <>
                Pris par <b>{it.assignedTo}</b> ✅
              </>
            ) : (
              <>À prendre ⏳</>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {/* EDIT */}
          <div>
            <div className="small" style={{ opacity: 0.7, marginBottom: 6 }}>Édition</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <select
                className="input"
                value={editCat}
                onChange={(e) => setEditCat(e.target.value as BringCategory)}
              >
                {CATS.map((c) => (
                  <option key={c} value={c}>
                    {catEmoji(c)} {c}
                  </option>
                ))}
              </select>

              <input
                className="input"
                style={{ minWidth: 260 }}
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
              />

              <button
                className="btn"
                onClick={() => onSave(it.id, editLabel.trim(), editCat)}
                disabled={loading || editLabel.trim().length === 0}
              >
                Sauver
              </button>
            </div>
          </div>

          {/* ASSIGN */}
          <div>
            <div className="small" style={{ opacity: 0.7, marginBottom: 6 }}>Attribution</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <select
                className="input"
                style={{ paddingRight: 38, minWidth: 220 }}
                value={it.assignedTo}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "__other__") {
                    const name = prompt("Prénom (manuel) :");
                    if (!name || !name.trim()) return;
                    onAssign(it.id, name.trim());
                    return;
                  }
                  onAssign(it.id, v);
                }}
              >
                <option value="">— Libre —</option>
                {people.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="__other__">Autre…</option>
              </select>

              <button className="btn" onClick={() => onAssign(it.id, "")} disabled={loading || !taken}>
                Libérer
              </button>

              <button className="btn" onClick={() => onDelete(it.id)} disabled={loading} style={{ opacity: 0.9 }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
