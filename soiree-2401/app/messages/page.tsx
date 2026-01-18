"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type WallMessage = {
  id: string;
  name: string;
  text: string;
  createdAt: number;
};

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 10) return "à l’instant";
  if (s < 60) return `il y a ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  return `il y a ${h} h`;
}

export default function MessagesPage() {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<WallMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const canSend = useMemo(() => text.trim().length > 0 && !loading, [text, loading]);

  async function load() {
    try {
      const res = await fetch("/api/messages", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (data?.ok) setMessages(data.messages || []);
    } catch {}
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // auto-refresh
    return () => clearInterval(t);
  }, []);

  async function send() {
    if (!canSend) return;
    setLoading(true);
    setInfo(null);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text }),
      });
      const data = await res.json().catch(() => ({}));

      if (data?.ok) {
        setText("");
        setInfo("Envoyé ✅");
        await load();
      } else {
        setInfo(data?.error || "Erreur envoi");
      }
    } catch {
      setInfo("Erreur envoi");
    } finally {
      setLoading(false);
      setTimeout(() => setInfo(null), 1500);
    }
  }

  return (
    <div className="bg">
      <div className="container">
        <nav>
          <Link className="btn" href="/">Accueil</Link>
          <Link className="btn" href="/infos">Infos</Link>
          <Link className="btn" href="/rsvp">RSVP</Link>
          <Link className="btn" href="/todo">To-do</Link>
          <Link className="btn" href="/musique">Musique</Link>
          <Link className="btn" href="/messages">Messages</Link>
          <Link className="btn" href="/reglement">Règlement</Link>
        </nav>

        <div style={{ height: 18 }} />

        <div className="card">
          <h1 className="h1" style={{ fontSize: 34 }}>Mur de messages</h1>
          <p className="p">Balance un mot, une blague, une info utile (anonyme possible).</p>

          <div className="sep" />

          <div className="grid2">
            <div>
              <label className="label">Pseudo (optionnel)</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Enzo"
                maxLength={24}
              />
            </div>

            <div>
              <label className="label">Message</label>
              <input
                className="input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ex: Qui veut des glaçons ?"
                maxLength={240}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn" onClick={send} disabled={!canSend}>
              {loading ? "Envoi..." : "Envoyer"}
            </button>
            <button className="btn" onClick={load}>
              Rafraîchir
            </button>
            {info && <span className="small">{info}</span>}
          </div>

          <div style={{ height: 14 }} />

          <div style={{ display: "grid", gap: 10 }}>
            {messages.length === 0 ? (
              <div className="small" style={{ opacity: 0.8 }}>Aucun message pour l’instant.</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="card" style={{ padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontWeight: 800 }}>{m.name}</div>
                    <div className="small" style={{ opacity: 0.7 }}>{timeAgo(m.createdAt)}</div>
                  </div>
                  <div style={{ marginTop: 8, lineHeight: 1.5 }}>{m.text}</div>
                </div>
              ))
            )}
          </div>

          <div style={{ height: 10 }} />
          <div className="small" style={{ opacity: 0.75 }}>
            Règle : reste cool 😄 (anti-spam activé).
          </div>
        </div>
      </div>
    </div>
  );
}
