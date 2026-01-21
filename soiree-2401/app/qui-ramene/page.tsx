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

export default function QuiRamenePage() {
  const [items, setItems] = useState<BringItem[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<BringCategory>("Nourriture");
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
      // silencieux (comme messages)
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  async function addItem() {
    const v = label.trim();
    if (!v) return;

    setLoading(true);
    setInfo(null);
    try {
      const data = await api("POST", { label: v, category });
      setItems(data.items || []);
      setPeople(data.people || []);
      setLabel("");
      setInfo("Ajouté ✅");
    } catch (e: any) {
      setInfo(e?.message || "Erreur ajout");
    } finally {
      setLoading(false);
      setTimeout(() => setInfo(null), 1500);
    }
  }

  async function assignItem(id: string, assignedTo: string) {
    setLoading(true);
    setInfo(null);
    try {
      const data = await api("PATCH", { id, assignedTo });
      setItems(data.items || []);
      setPeople(data.people || []);
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
          <Link className="btn" href="/roulette">Roulette</Link>
          <Link className="btn" href="/musique">Musique</Link>
          <Link className="btn" href="/messages">Messages</Link>
          <Link className="btn" href="/reglement">Règlement</Link>
        </nav>

        <div style={{ height: 18 }} />

        <div className="card">
          <h1 className="h1" style={{ fontSize: 34 }}>Qui ramène ?</h1>
          <p className="p">On répartit les apports pour éviter les doublons (softs, alcool, nourriture, matériel).</p>

          <div className="sep" />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span className="chip">✅ Pris : {stats.taken}/{stats.total}</span>
            <span className="chip">⏳ Restant : {stats.remaining}</span>
            <button className="btn" onClick={load} disabled={loading}>Rafraîchir</button>
            {info && <span className="small">{info}</span>}
          </div>

          <div style={{ height: 14 }} />

          <div className="grid2">
            <div>
              <label className="label">Catégorie</label>
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value as BringCategory)}
              >
                {CATS.map((c) => (
                  <option key={c} value={c}>
                    {catEmoji(c)} {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Ajouter un truc</label>
              <input
                className="input"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: 2L coca, pack bières, chips..."
                maxLength={60}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addItem();
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn" onClick={addItem} disabled={loading || label.trim().length === 0}>
              {loading ? "..." : "Ajouter"}
            </button>

          </div>

          <div style={{ height: 14 }} />

          <div style={{ display: "grid", gap: 10 }}>
            {items.length === 0 ? (
              <div className="small" style={{ opacity: 0.8 }}>Aucun item pour l’instant.</div>
            ) : (
              items.map((it) => {
                const taken = it.assignedTo.trim().length > 0;

                return (
                  <div key={it.id} className="card" style={{ padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      {/* LEFT (amélioré) */}
                      <div style={{ minWidth: 260 }}>
                        {/* Ligne 1: titre */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ fontSize: 18, lineHeight: 1 }}>{catEmoji(it.category)}</div>
                          <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: -0.2 }}>
                            {it.label}
                          </div>
                        </div>

                        {/* Ligne 2: meta */}
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
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <div>
                          <div className="small" style={{ opacity: 0.7, marginBottom: 6 }}>Attribution</div>

                          <select
                            className="input"
                            style={{ paddingRight: 38, minWidth: 220 }}
                            value={it.assignedTo}
                            onChange={(e) => {
                              const v = e.target.value;

                              if (v === "__other__") {
                                const name = prompt("Prénom (manuel) :");
                                if (!name || !name.trim()) return;
                                assignItem(it.id, name.trim());
                                return;
                              }

                              assignItem(it.id, v);
                            }}
                          >
                            <option value="">— Libre —</option>
                            {people.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                            <option value="__other__">Autre…</option>
                          </select>
                        </div>

                        <button
                          className="btn"
                          onClick={() => assignItem(it.id, "")}
                          disabled={loading || !taken}
                          title="Libérer"
                        >
                          Libérer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ height: 12 }} />
          <div className="small" style={{ opacity: 0.75 }}>
            Astuce : si quelqu’un n’est pas dans la liste, choisis <b>“Autre…”</b> et mets son prénom.
          </div>
        </div>

        <div style={{ height: 16 }} />
        <div className="small" style={{ opacity: 0.7 }} />
      </div>
    </div>
  );
}
