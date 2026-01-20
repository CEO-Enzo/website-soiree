"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const from = useMemo(() => {
    const f = sp.get("from") || "/";
    // évite de reboucler vers /login
    if (f.startsWith("/login")) return "/";
    return f;
  }, [sp]);

  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok || !data?.ok) {
        setErr(data?.message || "Mot de passe incorrect ou erreur serveur.");
        setLoading(false);
        return;
      }

      // force un refresh côté app router (cookies/session)
      router.replace(from);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg">
      <div className="container">
        <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
          <h1 className="h1" style={{ fontSize: 34 }}>Accès privé</h1>
          <p className="p">Entre le mot de passe pour accéder au site.</p>
          <div className="sep" />

          <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
            <div>
              <label className="label">Mot de passe</label>
              <input
                className="input"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            {err && (
              <div className="card" style={{ borderColor: "rgba(255,80,80,0.35)" }}>
                <div style={{ color: "rgba(255,180,180,0.95)" }}>{err}</div>
              </div>
            )}

            <button className="btn" type="submit" disabled={loading || !pw}>
              {loading ? "Connexion..." : "Entrer"}
            </button>

            {/* mini debug utile */}
            <div style={{ opacity: 0.6, fontSize: 12 }}>
              Redirection après login : <code>{from}</code>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
