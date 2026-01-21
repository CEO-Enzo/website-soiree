"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function RoulettePage() {
  const [names, setNames] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const canJoin = useMemo(
    () => selected.trim().length > 0 && !loading,
    [selected, loading]
  );

  // Charger les présents (storage/presents.txt via API)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/roulette/names", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        setNames(Array.isArray(data.names) ? data.names : []);
      } catch {
        setNames([]);
      }
    })();
  }, []);

  async function loadParticipants() {
    try {
      const res = await fetch("/api/roulette/state", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (data?.ok) setParticipants(data.roulette?.participants || []);
    } catch {
      // silencieux
    }
  }

  useEffect(() => {
    loadParticipants();
    const t = setInterval(loadParticipants, 3000);
    return () => clearInterval(t);
  }, []);

  async function join() {
    if (!canJoin) return;

    setLoading(true);
    setErr(null);
    setInfo(null);

    try {
      const res = await fetch("/api/roulette/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selected }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        setErr(data?.error || `Erreur (${res.status})`);
        setLoading(false);
        return;
      }

      setSelected("");
      setInfo("Ajouté ✅");
      setTimeout(() => setInfo(null), 1500);

      setLoading(false);
      loadParticipants();
    } catch {
      setErr("Erreur réseau");
      setLoading(false);
    }
  }

  return (
    <div className="bg">
      <div className="container">
        {/* NAVBAR */}
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
          <h1 className="h1" style={{ fontSize: 34 }}>Roulette 🎡</h1>
          <p className="p">
            Sélectionne ton nom et clique sur « Je participe ».
          </p>

          <div className="sep" />

          {/* FEEDBACK */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span className="chip">👥 Participants : {participants.length}</span>
            <button
              className="btn"
              onClick={loadParticipants}
              disabled={loading}
            >
              Rafraîchir
            </button>
            {info && <span className="small">{info}</span>}
            {err && (
              <span className="small" style={{ opacity: 0.9 }}>
                ❌ {err}
              </span>
            )}
          </div>

          <div style={{ height: 14 }} />

          {/* SELECT + CTA */}
          <div className="grid2">
            <div>
              <label className="label">Ton nom</label>
              <select
                className="input"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="" disabled>
                  — Sélectionne ton nom —
                </option>
                {names.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <div
                className="small"
                style={{ opacity: 0.7, marginTop: 8 }}
              >
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "end",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                className="btn"
                onClick={join}
                disabled={!canJoin}
              >
                {loading ? "Ajout..." : "Je participe"}
              </button>
            </div>
          </div>

          <div style={{ height: 14 }} />

          {/* PARTICIPANTS */}
          <div className="card" style={{ padding: 14 }}>
            <div className="section-title">Participants</div>

            {participants.length === 0 ? (
              <div
                className="small"
                style={{ opacity: 0.7, marginTop: 8 }}
              >
                Personne pour l’instant.
              </div>
            ) : (
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                {participants.map((p) => (
                  <span
                    key={p}
                    className="chip"
                    style={{ fontWeight: 900 }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}

            <div
              className="small"
              style={{ marginTop: 12, opacity: 0.75 }}
            >
            </div>
          </div>
        </div>

        <div style={{ height: 16 }} />
        <div className="small" style={{ opacity: 0.7 }} />
      </div>
    </div>
  );
}
