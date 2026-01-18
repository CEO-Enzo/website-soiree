"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RouletteState = {
  participants: string[];
  lastWinner: string | null;
  lastWinnerIndex: number | null;
  lastSpinAt: number | null;
  lastParticipants: string[];
};

export default function RouletteAdminPage() {
  const [roulette, setRoulette] = useState<RouletteState>({
    participants: [],
    lastWinner: null,
    lastWinnerIndex: null,
    lastSpinAt: null,
    lastParticipants: [],
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/roulette/state", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (data?.ok) setRoulette(data.roulette);
    } catch {}
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, []);

  async function spin() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/roulette/spin", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        setErr(data?.error || `Erreur (${res.status})`);
        setLoading(false);
        return;
      }

      setRoulette(data.roulette);
      setLoading(false);
    } catch {
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
        <Link className="btn" href="/dashboard">Dashboard</Link>
        <Link className="btn" href="/roulette">Roulette</Link>
        <Link className="btn" href="/">Accueil</Link>
      </div>

      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          background: "rgba(255,255,255,0.05)",
          borderRadius: 24,
          padding: 28,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 34 }}>🎛️</div>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 950, margin: 0 }}>Roulette Admin</h1>
            <div style={{ opacity: 0.7 }}>
              Lance la roulette depuis ici (à projeter / contrôler par le DJ).
            </div>
          </div>
        </div>

        <hr style={{ margin: "22px 0", opacity: 0.2 }} />

        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 18,
            padding: 18,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 18 }}>
            Participants ({roulette.participants?.length || 0})
          </div>

          {roulette.participants?.length ? (
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 10 }}>
              {roulette.participants.map((p) => (
                <span
                  key={p}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    fontWeight: 900,
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ opacity: 0.6, marginTop: 8 }}>Personne pour l’instant</div>
          )}

          <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={spin}
              disabled={loading}
              className="btn"
              style={{
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 950,
              }}
            >
              Lancer la roulette 🎡
            </button>

            {err && <div style={{ color: "#ffb3b3", fontWeight: 900 }}>{err}</div>}
          </div>

          <div style={{ marginTop: 10, opacity: 0.6, fontSize: 13 }}>
            Astuce : laisse le dashboard ouvert sur le projecteur, et lance ici → la roue apparaît en grand.
          </div>
        </div>
      </div>
    </div>
  );
}
