"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type MusicItem = { id?: string; name: string; artist: string; image?: string | null };

type DashboardMusic = {
  current: (MusicItem & { progressMs?: number; durationMs?: number }) | null;
  next: MusicItem[];
};

type Message = { id: string; name: string; text: string; createdAt: number };

type RouletteState = {
  participants: string[];
  lastSpinAt: number | null;
};

function hhmm(ts: number) {
  try {
    return new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function msToMMSS(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

// 🔊 son “marquant”
function playSpinSoundLoud() {
  try {
    const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);

    const now = ctx.currentTime;

    // “whoosh + thump”
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const out = noiseBuffer.getChannelData(0);
    for (let i = 0; i < out.length; i++) out[i] = (Math.random() * 2 - 1) * 0.35;

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(260, now);
    filter.frequency.exponentialRampToValueAtTime(2600, now + 0.25);
    filter.frequency.exponentialRampToValueAtTime(800, now + 1.2);

    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, now);
    ng.gain.exponentialRampToValueAtTime(1.0, now + 0.03);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);

    noise.connect(filter);
    filter.connect(ng);
    ng.connect(master);

    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(100, now);
    o.frequency.exponentialRampToValueAtTime(55, now + 0.3);

    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, now);
    og.gain.exponentialRampToValueAtTime(0.9, now + 0.02);
    og.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    o.connect(og);
    og.connect(master);

    noise.start(now);
    noise.stop(now + 1.3);
    o.start(now);
    o.stop(now + 0.33);

    setTimeout(() => ctx.close().catch(() => {}), 1700);
  } catch {}
}

export default function DashboardPage() {
  const [now, setNow] = useState(new Date());

  const [music, setMusic] = useState<DashboardMusic>({ current: null, next: [] });
  const [messages, setMessages] = useState<Message[]>([]);
  const [roulette, setRoulette] = useState<RouletteState>({ participants: [], lastSpinAt: null });

  const chatRef = useRef<HTMLDivElement | null>(null);

  // ---- Roulette overlay (visuel-only) ----
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [wheelNames, setWheelNames] = useState<string[]>([]);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  function startWheelSpin() {
    playSpinSoundLoud();

    const extraTurns = 10;
    const randomOffset = Math.random() * 360;
    const final = extraTurns * 360 + randomOffset;

    setSpinning(true);
    requestAnimationFrame(() => setWheelRotation(final));

    // spin ~8s, puis affichage ~12s => total ~20s
    setTimeout(() => {
      setSpinning(false);
      setTimeout(() => setOverlayOpen(false), 12000);
    }, 8000);
  }

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  async function load() {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!data?.ok) return;

      setMusic(data.music || { current: null, next: [] });
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setRoulette(data.roulette || { participants: [], lastSpinAt: null });
    } catch {}
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 7000);
    return () => clearInterval(t);
  }, []);

  // Messages
  const chatMessages = useMemo(() => (messages || []).slice(0, 18).reverse(), [messages]);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chatMessages.length]);

  // Trigger overlay on spin
  useEffect(() => {
    const ts = roulette?.lastSpinAt;
    if (!ts) return;

    const key = "dash_spin_seen";
    const seen = Number(localStorage.getItem(key) || "0");
    if (ts <= seen) return;
    localStorage.setItem(key, String(ts));

    const pool = (roulette.participants || []).slice();
    if (pool.length === 0) return;

    setWheelNames(pool);
    setWheelRotation(0);
    setOverlayOpen(true);

    setTimeout(() => startWheelSpin(), 150);
  }, [roulette?.lastSpinAt]);

  // Wheel background
  const wheelBg = useMemo(() => {
    const n = Math.max(1, wheelNames.length);
    const stops: string[] = [];
    for (let i = 0; i < n; i++) {
      const a0 = (i * 360) / n;
      const a1 = ((i + 1) * 360) / n;
      const hue = Math.round((i * 360) / n);
      stops.push(`hsla(${hue}, 72%, 50%, 0.45) ${a0}deg ${a1}deg`);
    }
    return `conic-gradient(from -90deg, ${stops.join(",")})`;
  }, [wheelNames]);

  const currentProgress = music.current?.progressMs ?? 0;
  const currentDuration = music.current?.durationMs ?? 0;
  const pct = currentDuration ? clamp((currentProgress / currentDuration) * 100, 0, 100) : 0;

  const after23 = now.getHours() >= 23;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0b0b0f,#0f1220)",
        color: "white",
        padding: 26,
        boxSizing: "border-box",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Overlay roulette */}
      {overlayOpen && (
        <div
          onClick={() => setOverlayOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.74)",
            backdropFilter: "blur(10px)",
            display: "grid",
            placeItems: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              width: "min(1100px, 96vw)",
              borderRadius: 28,
              padding: 22,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 950, opacity: 0.9 }}>🎡 Roulette</div>

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                alignItems: "center",
              }}
            >
              <div style={{ display: "grid", placeItems: "center" }}>
                <div style={{ position: "relative", width: 560, height: 560, maxWidth: "44vw", maxHeight: "44vw" }}>
                  {/* Pointer */}
                  <div
                    style={{
                      position: "absolute",
                      top: -10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 0,
                      height: 0,
                      borderLeft: "18px solid transparent",
                      borderRight: "18px solid transparent",
                      borderBottom: "32px solid rgba(255,255,255,0.96)",
                      filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.45))",
                      zIndex: 3,
                    }}
                  />

                  {/* Wheel */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background: wheelBg,
                      border: "2px solid rgba(255,255,255,0.16)",
                      boxShadow: "0 40px 120px rgba(0,0,0,0.40)",
                      transform: `rotate(${wheelRotation}deg)`,
                      transition: spinning ? "transform 8s cubic-bezier(0.08, 0.92, 0.10, 1)" : "none",
                    }}
                  />

                  {/* Labels (rotent avec la roue) */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      transform: `rotate(${wheelRotation}deg)`,
                      transition: spinning ? "transform 8s cubic-bezier(0.08, 0.92, 0.10, 1)" : "none",
                      pointerEvents: "none",
                    }}
                  >
                    {wheelNames.map((name, i) => {
                      const n = wheelNames.length || 1;
                      const step = 360 / n;
                      const ang = i * step + step / 2;
                      return (
                        <div
                          key={`${name}-${i}`}
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: `rotate(${ang}deg) translateY(-210px) rotate(${-ang}deg)`,
                            transformOrigin: "center",
                            width: 180,
                            textAlign: "center",
                            fontWeight: 950,
                            fontSize: 14,
                            opacity: 0.92,
                            textShadow: "0 10px 30px rgba(0,0,0,0.45)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {name}
                        </div>
                      );
                    })}
                  </div>

                  {/* Center cap */}
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%,-50%)",
                      width: 104,
                      height: 104,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.55)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      display: "grid",
                      placeItems: "center",
                      zIndex: 2,
                      fontWeight: 950,
                      opacity: 0.9,
                    }}
                  >
                    SPIN
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "left" }}>
                <div style={{ opacity: 0.75 }}>Participants</div>
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {wheelNames.slice(0, 30).map((n) => (
                    <span
                      key={n}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        fontWeight: 900,
                      }}
                    >
                      {n}
                    </span>
                  ))}
                  {wheelNames.length > 30 && <span style={{ opacity: 0.7 }}>+{wheelNames.length - 30}</span>}
                </div>

                <div style={{ marginTop: 16, opacity: 0.55, fontSize: 13 }}>
                  (clique pour fermer)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout : gauche messages/roulette, droite musique */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 18, minHeight: "calc(100vh - 52px)" }}>
        {/* LEFT */}
        <div style={{ display: "grid", gridTemplateRows: "auto 2fr 1fr", gap: 18, minHeight: 0 }}>
          {/* Heure only */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 22,
              padding: 18,
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 52, fontWeight: 980, lineHeight: 1 }}>
              {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </div>

            <div style={{ textAlign: "right" }}>
              {after23 ? (
                <span
                  style={{
                    padding: "10px 16px",
                    borderRadius: 999,
                    background: "#ff7a18",
                    color: "#000",
                    fontWeight: 950,
                  }}
                >
                  🔕 Volume réduit
                </span>
              ) : (
                <span style={{ opacity: 0.7 }}>🌙 Mode normal</span>
              )}
              <div style={{ opacity: 0.7, marginTop: 6, fontWeight: 800 }}>📍 Salle 37 de Authie</div>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 22,
              padding: 18,
              display: "grid",
              gridTemplateRows: "auto 1fr",
              gap: 12,
              minHeight: 0,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <div style={{ fontSize: 30, fontWeight: 950 }}>💬 Messages</div>
              <div style={{ opacity: 0.6 }}>(live)</div>
            </div>

            <div
              ref={chatRef}
              style={{
                overflow: "auto",
                paddingRight: 8,
                display: "grid",
                gap: 10,
                alignContent: "end",
                minHeight: 0,
              }}
            >
              {chatMessages.length === 0 ? (
                <div style={{ opacity: 0.6 }}>Aucun message…</div>
              ) : (
                chatMessages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 18,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        lineHeight: 1.35,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <span style={{ fontWeight: 950 }}>{m.name}</span>
                      <span style={{ opacity: 0.7 }}> : </span>
                      <span style={{ fontWeight: 800 }}>{m.text}</span>
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.6, flex: "none" }}>{hhmm(m.createdAt)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Roulette summary (no winner) */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 22,
              padding: 18,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 950 }}>🎡 Roulette</div>
            <div style={{ marginTop: 8, opacity: 0.8 }}>
              Participants : <strong>{roulette.participants?.length || 0}</strong>
            </div>
            <div style={{ marginTop: 10, opacity: 0.6, fontSize: 13 }}>
              (Participation sur <strong>/roulette</strong>, tirage depuis <strong>/roulette/admin</strong>)
            </div>
          </div>
        </div>

        {/* RIGHT MUSIC */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 22,
            padding: 22,
            display: "grid",
            gridTemplateRows: "auto auto 1fr",
            gap: 16,
            minHeight: 0,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 950 }}>🎶 En cours</div>

          {music.current ? (
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              {music.current.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={music.current.image} alt="" style={{ width: 150, height: 150, borderRadius: 18 }} />
              )}
              <div style={{ minWidth: 0, width: "100%" }}>
                <div style={{ fontSize: 34, fontWeight: 980, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {music.current.name}
                </div>
                <div style={{ fontSize: 20, opacity: 0.85 }}>{music.current.artist}</div>

                {/* Barre de temps */}
                <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", opacity: 0.8, fontWeight: 900, fontSize: 13 }}>
                    <span>{msToMMSS(currentProgress)}</span>
                    <span>{msToMMSS(currentDuration)}</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "rgba(255,255,255,0.80)" }} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ opacity: 0.6 }}>Lance Spotify sur le PC 🎧</div>
          )}

          <div style={{ minHeight: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 10 }}>À venir (top 10)</div>
            <div style={{ display: "grid", gap: 10, overflow: "auto", paddingRight: 8, minHeight: 0 }}>
              {(music.next || []).slice(0, 10).map((t, idx) => (
                <div
                  key={t.id || `${t.name}-${t.artist}-${idx}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "44px 1fr auto",
                    gap: 12,
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.035)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {t.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.image} width={44} height={44} alt="" style={{ borderRadius: 12 }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)" }} />
                  )}

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 950, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.name}
                    </div>
                    <div style={{ opacity: 0.78, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.artist}
                    </div>
                  </div>

                  <div style={{ opacity: 0.55, fontWeight: 950, fontSize: 13 }}>#{idx + 1}</div>
                </div>
              ))}
              {(music.next || []).length === 0 && <div style={{ opacity: 0.6 }}>Aucune musique en attente.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
