"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Track = {
  id: string;
  uri: string;
  name: string;
  artist: string;
  album: string;
  image?: string;
};

type QueueItem = {
  id: string;
  name: string;
  artist: string;
  image?: string | null;
};

type CurrentItem = {
  name: string;
  artist: string;
  image?: string | null;
} | null;

export default function MusiquePage() {
  const [connected, setConnected] = useState(false);
  const [device, setDevice] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [items, setItems] = useState<Track[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const [showQueue, setShowQueue] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [current, setCurrent] = useState<CurrentItem>(null);

  useEffect(() => {
    fetch("/api/spotify/status")
      .then((r) => r.json())
      .then((d) => {
        setConnected(!!d.connected);
        setDevice(d.device || null);
      });
  }, []);

  async function search() {
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setItems([]);
    }
  }

  async function add(uri: string) {
    const res = await fetch("/api/spotify/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uri }),
    });

    if (res.ok) setMsg("Ajouté à la file ✅");
    else setMsg("Erreur ajout ❌");

    setTimeout(() => setMsg(null), 1500);
  }

  async function loadQueue() {
    const res = await fetch("/api/spotify/queue-get");
    const data = await res.json().catch(() => ({}));
    if (data?.ok) {
      setCurrent(data.currently || null);
      setQueue(data.queue || []);
    } else {
      setCurrent(null);
      setQueue([]);
    }
  }

  // styles "responsive" inline
  const rowStyle: React.CSSProperties = {
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap", // ✅ important: évite le dépassement sur mobile
  };

  const textWrap: React.CSSProperties = {
    flex: 1,
    minWidth: 220, // ✅ sur mobile ça force le texte à passer à la ligne si besoin
  };

  const btnWrap: React.CSSProperties = {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-end",
  };

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
          <h1 className="h1">Demander une musique</h1>
          <p className="p">Recherche un titre et ajoute-le à la file Spotify du DJ.</p>

          <div className="sep" />

          {!connected ? (
            <a className="btn" href="/api/spotify/login">
              Connecter Spotify (DJ)
            </a>
          ) : (
            <p className="small">
              Spotify connecté ✅ {device ? `• Appareil : ${device}` : "• Lance Spotify sur le PC si besoin"}
            </p>
          )}

          <div style={{ height: 14 }} />

          <div className="grid2">
            <div>
              <label className="label">Recherche</label>
              <input
                className="input"
                placeholder="Ex: Stromae papaoutai"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
              />
            </div>

            <div style={{ display: "flex", alignItems: "end", gap: 10, flexWrap: "wrap" }}>
              <button className="btn" onClick={search} disabled={!q.trim()}>
                Rechercher
              </button>

              <button
                className="btn"
                onClick={async () => {
                  const next = !showQueue;
                  setShowQueue(next);
                  if (next) await loadQueue();
                }}
                disabled={!connected}
              >
                {showQueue ? "Masquer la file" : "Voir la file d’attente"}
              </button>
            </div>
          </div>

          {msg && <p className="small" style={{ marginTop: 10 }}>{msg}</p>}

          {/* Résultats */}
          <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
            {items.map((t) => (
              <div
                key={t.id}
                className="card"
                style={{
                  ...rowStyle,
                  padding: 14,
                  overflow: "hidden", // ✅ sécurité anti overflow
                }}
              >
                {t.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.image} width={44} height={44} alt="" style={{ borderRadius: 12, flex: "0 0 auto" }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: 12, border: "1px solid var(--border)" }} />
                )}

                <div style={textWrap}>
                  <strong
                    style={{
                      display: "block",
                      // ✅ sur mobile on laisse respirer (pas de nowrap)
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {t.name}
                  </strong>
                  <div
                    className="small"
                    style={{
                      marginTop: 4,
                      opacity: 0.85,
                      // ✅ autorise le retour à la ligne si ça déborde
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
                    {t.artist} • {t.album}
                  </div>
                </div>

                <div style={btnWrap}>
                  <button
                    className="btn"
                    onClick={() => add(t.uri)}
                    disabled={!connected}
                    style={{
                      // ✅ sur mobile, bouton prend toute la largeur si wrap
                      minWidth: 120,
                    }}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FILE D’ATTENTE */}
          {showQueue && (
            <div style={{ marginTop: 18 }}>
              <div className="sep" />

              <div className="section-title">En cours</div>
              {current ? (
                <div className="card" style={{ ...rowStyle, padding: 14 }}>
                  {current.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={current.image} width={44} height={44} alt="" style={{ borderRadius: 12 }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 12, border: "1px solid var(--border)" }} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <strong
                      style={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}
                    >
                      {current.name}
                    </strong>
                    <div className="small" style={{ opacity: 0.85 }}>{current.artist}</div>
                  </div>
                </div>
              ) : (
                <div className="small">Rien en lecture (lance Spotify sur le PC).</div>
              )}

              <div style={{ height: 12 }} />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div className="section-title" style={{ margin: 0 }}>File d’attente</div>
                <button className="btn" onClick={loadQueue} disabled={!connected}>
                  Rafraîchir
                </button>
              </div>

              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                {queue.length === 0 ? (
                  <div className="small">Aucune musique en attente.</div>
                ) : (
                  queue.map((t) => (
                    <div key={t.id} className="card" style={{ ...rowStyle, padding: 14 }}>
                      {t.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.image} width={40} height={40} alt="" style={{ borderRadius: 12 }} />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid var(--border)" }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong
                          style={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t.name}
                        </strong>
                        <div className="small" style={{ opacity: 0.85, overflowWrap: "anywhere" }}>
                          {t.artist}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
