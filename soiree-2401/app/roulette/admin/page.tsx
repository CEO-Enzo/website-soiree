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

const EMPTY_ROULETTE: RouletteState = {
  participants: [],
  lastWinner: null,
  lastWinnerIndex: null,
  lastSpinAt: null,
  lastParticipants: [],
};

export default function RouletteAdminPage() {
  const [roulette, setRoulette] = useState<RouletteState>(EMPTY_ROULETTE);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const safeRoulette = roulette ?? EMPTY_ROULETTE;

  async function load() {
    try {
      const res = await fetch("/api/roulette/state", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (data?.ok) setRoulette((data.roulette as RouletteState) ?? EMPTY_ROULETTE);
    } catch {
      // silencieux (comme tes pages)
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, []);

  async function spin() {
    setLoading(true);
    setErr(null);
    setInfo(null);

    try {
      const res = await fetch("/api/roulette/spin", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        setErr(data?.error || `Erreur (${res.status})`);
        setLoading(false);
        return;
      }

      setRoulette((data.roulette as RouletteState) ?? EMPTY_ROULETTE);
      setInfo("Lancé ✅");
      setTimeout(() => setInfo(null), 1500);
      setLoading(false);
    } catch {
      setErr("Erreur réseau");
      setLoading(false);
    }
  }

  return (
    <div className="bg">
      <div className="container">
        {/* NAVBAR (même style que le reste) */}
        <nav>
          <Link className="btn" href="/">Accueil</Link>
          <Link className="btn" href="/dashboard">Dashboard</Link>
          <Link className="btn" href="/roulette">Roulette</Link>
        </nav>

        <div style={{ height: 18 }} />

        <div className="card">
          <h1 className="h1" style={{ fontSize: 34 }}>Roulette Admin</h1>
          <p className="p">Lance la roulette depuis ici (pratique pour projeter / contrôler).</p>

          <div className="sep" />

          {/* TOP INFOS */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span className="chip">👥 Participants : {safeRoulette.participants.length}</span>
            {safeRoulette.lastWinner ? (
              <span className="chip">🏆 Dernier : {safeRoulette.lastWinner}</span>
            ) : (
              <span className="chip">🏆 Dernier : —</span>
            )}

            <button className="btn" onClick={load} disabled={loading}>
              Rafraîchir
            </button>

            {info && <span className="small">{info}</span>}
            {err && <span className="small" style={{ opacity: 0.9 }}>❌ {err}</span>}
          </div>

          <div style={{ height: 14 }} />

          {/* LISTE PARTICIPANTS */}
          <div className="card" style={{ padding: 14 }}>
            <div className="section-title">Participants</div>

            {safeRoulette.participants.length ? (
              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 10 }}>
                {safeRoulette.participants.map((p) => (
                  <span key={p} className="chip" style={{ fontWeight: 900 }}>
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <div className="small" style={{ opacity: 0.7, marginTop: 8 }}>
                Personne pour l’instant.
              </div>
            )}

            <div style={{ height: 14 }} />

            {/* ACTIONS */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button className="btn" onClick={spin} disabled={loading || safeRoulette.participants.length === 0}>
                {loading ? "Lancement..." : "Lancer la roulette 🎡"}
              </button>

              <div className="small" style={{ opacity: 0.75 }}>
                Astuce : laisse <b>/roulette</b> sur le projecteur, et lance ici.
              </div>
            </div>

            {safeRoulette.participants.length === 0 && (
              <div className="small" style={{ opacity: 0.65, marginTop: 10 }}>
                Ajoute des participants depuis la page Roulette.
              </div>
            )}
          </div>
        </div>

        <div style={{ height: 16 }} />
        <div className="small" style={{ opacity: 0.7 }} />
      </div>
    </div>
  );
}
