"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RSVPPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload: any = Object.fromEntries(fd.entries());
    payload.guests = Number(payload.guests || 1);

    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok || !data.ok) {
      setError(data?.error || "Erreur, réessaie.");
      return;
    }

    router.push("/merci");
  }

  return (
    <div className="bg">
      <div className="container">
        <nav>
          <Link className="btn" href="/">Accueil</Link>
          <Link className="btn" href="/infos">Infos</Link>
          <Link className="btn" href="/rsvp">RSVP</Link>
        </nav>

        <div style={{ height: 18 }} />

        <div className="card">
          <h1 className="h1" style={{ fontSize: 34 }}>RSVP</h1>
          <p className="p">Réponds ici, c’est enregistré directement sur le site.</p>

          <div className="sep" />

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
            <div className="grid2">
              <div>
                <label className="label">Nom / prénom *</label>
                <input className="input" name="name" required placeholder="Ex: Enzo" />
              </div>
              <div>
                <label className="label">Téléphone (optionnel)</label>
                <input className="input" name="phone" placeholder="06..." />
              </div>
            </div>

            <div className="grid2">
              <div>
                <label className="label">Tu viens ?</label>
                <select className="select" name="status" defaultValue="yes">
                  <option value="yes">Oui</option>
                  <option value="maybe">Peut-être</option>
                  <option value="no">Non</option>
                </select>
              </div>
              <div>
                <label className="label">Nombre de personnes (1–6)</label>
                <input className="input" name="guests" type="number" min={1} max={6} defaultValue={1} />
              </div>
            </div>

            <div>
              <label className="label">Note (optionnel)</label>
              <textarea className="textarea" name="note" rows={4} placeholder="Allergies, +1, info..." />
            </div>

            {error && (
              <div className="card" style={{ borderColor: "rgba(255,80,80,0.35)" }}>
                <div style={{ color: "rgba(255,180,180,0.95)" }}>{error}</div>
              </div>
            )}

            <button className="btn" disabled={loading} type="submit">
              {loading ? "Envoi..." : "Envoyer ma réponse"}
            </button>

            <div className="small">Données privées — accès protégé par mot de passe.</div>
          </form>
        </div>
      </div>
    </div>
  );
}
