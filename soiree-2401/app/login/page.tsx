"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const from = sp.get("from") || "/";

  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      setErr("Mot de passe incorrect.");
      return;
    }

    router.replace(from);
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
              <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
            </div>

            {err && (
              <div className="card" style={{ borderColor: "rgba(255,80,80,0.35)" }}>
                <div style={{ color: "rgba(255,180,180,0.95)" }}>{err}</div>
              </div>
            )}

            <button className="btn" type="submit">Entrer</button>
          </form>
        </div>
      </div>
    </div>
  );
}
