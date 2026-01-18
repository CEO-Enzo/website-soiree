"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RoulettePage() {
  const [names, setNames] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Charger les présents (storage/presents.txt)
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/roulette/names", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      setNames(Array.isArray(data.names) ? data.names : []);
    })();
  }, []);

  // Charger les participants actuels
  async function loadParticipants() {
    const res = await fetch("/api/roulette/state", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (data?.ok) {
      setParticipants(data.roulette?.participants || []);
    }
  }

  useEffect(() => {
    loadParticipants();
    const t = setInterval(loadParticipants, 3000);
    return () => clearInterval(t);
  }, []);

const [err, setErr] = useState<string | null>(null);

async function join() {
  if (!selected || loading) return;
  setLoading(true);
  setErr(null);

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
    setLoading(false);
    loadParticipants();
  } catch (e) {
    setErr("Erreur réseau");
    setLoading(false);
  }
}

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0b0b0f,#0f1220)",
        color: "white",
        padding: 32,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* NAV */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <Link className="btn" href="/">Accueil</Link>
        <Link className="btn" href="/musique">Musique</Link>
        <Link className="btn" href="/messages">Messages</Link>
        <Link className="btn" href="/roulette">Roulette</Link>
        <Link className="btn" href="/dashboard">Dashboard</Link>
      </div>

      {/* CARD */}
      <div
        style={{
          maxWidth: 820,
          margin: "0 auto",
          background: "rgba(255,255,255,0.05)",
          borderRadius: 24,
          padding: 28,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 34 }}>🎡</div>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 950, margin: 0 }}>
              Roulette
            </h1>
            <div style={{ opacity: 0.7 }}>
              Sélectionne ton nom et clique sur « Je participe »
            </div>
          </div>
        </div>

        <hr style={{ margin: "22px 0", opacity: 0.2 }} />

        {/* SELECT */}
        <label style={{ display: "block", marginBottom: 8, opacity: 0.85 }}>
          Ton nom
        </label>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 14,
            background: "rgba(0,0,0,0.35)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
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

        {/* BUTTON */}
        <button
          onClick={join}
          disabled={!selected || loading}
          style={{
            marginTop: 14,
            padding: "12px 18px",
            borderRadius: 14,
            fontWeight: 900,
            border: "none",
            background: selected
              ? "linear-gradient(135deg,#7c7cff,#5f5cff)"
              : "rgba(255,255,255,0.15)",
            color: "white",
            cursor: selected ? "pointer" : "not-allowed",
            opacity: loading ? 0.6 : 1,
          }}
        >
          Je participe
        </button>

        {/* PARTICIPANTS */}
        <div
          style={{
            marginTop: 26,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 18,
            padding: 18,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 18 }}>
            Participants ({participants.length})
          </div>

          {participants.length === 0 ? (
            <div style={{ opacity: 0.6, marginTop: 8 }}>
              Personne pour l’instant
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
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    fontWeight: 800,
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
