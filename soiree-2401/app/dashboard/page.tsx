"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type MusicItem = { id?: string; name: string; artist: string; image?: string | null };

type DashboardMusic = {
  current: (MusicItem & {
    progressMs?: number;
    durationMs?: number;
    progress_ms?: number;
    duration_ms?: number;
    isPlaying?: boolean;
    is_playing?: boolean;
  }) | null;
  next: MusicItem[];
};

type PlayerState = {
  isPlaying?: boolean;
  is_playing?: boolean;
  progressMs?: number;
  durationMs?: number;
  progress_ms?: number;
  duration_ms?: number;
};

type Message = { id: string; name: string; text: string; createdAt: number };

type RouletteState = {
  participants: string[];
  lastSpinAt: number | null;
  lastParticipants?: string[];
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

// ✅ tolérant camelCase / snake_case
function pickMs(obj: any, camel: string, snake: string): number {
  const v = obj?.[camel] ?? obj?.[snake];
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function pickBool(obj: any, camel: string, snake: string): boolean | undefined {
  const v = obj?.[camel] ?? obj?.[snake];
  if (typeof v === "boolean") return v;
  return undefined;
}

// 🔊 son “marquant”
function playSpinSoundLoud() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);

    const now = ctx.currentTime;

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
  const [player, setPlayer] = useState<PlayerState>({ isPlaying: true, progressMs: 0, durationMs: 0 });

  const [messages, setMessages] = useState<Message[]>([]);
  const [roulette, setRoulette] = useState<RouletteState>({ participants: [], lastSpinAt: null });

  const chatRef = useRef<HTMLDivElement | null>(null);

  // ---- Roulette overlay (slot vertical) ----
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [slotNames, setSlotNames] = useState<string[]>([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotRunning, setSlotRunning] = useState(false);
  const [finalName, setFinalName] = useState<string | null>(null);

  const lastTickRef = useRef(0);

  function startSlotSpin(names: string[]) {
    if (!names?.length) return;

    playSpinSoundLoud();
    lastTickRef.current = 0;

    setFinalName(null);
    setSlotRunning(true);

    let idx = Math.floor(Math.random() * names.length);
    setSlotIndex(idx);

    const totalMs = 12000;
    const start = performance.now();

    function step(t: number) {
      const elapsed = t - start;
      const p = clamp(elapsed / totalMs, 0, 1);
      const interval = 140 + (520 - 140) * (p * p);

      if (elapsed - lastTickRef.current >= interval) {
        lastTickRef.current = elapsed;
        idx = (idx + 1) % names.length;
        setSlotIndex(idx);
      }

      if (p < 1) requestAnimationFrame(step);
      else {
        setSlotRunning(false);
        const picked = names[idx] ?? null;
        setFinalName(picked);
        setTimeout(() => setOverlayOpen(false), 6000);
      }
    }

    requestAnimationFrame(step);
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

      const m: DashboardMusic = data.music || { current: null, next: [] };
      setMusic(m);

      const p: PlayerState =
        data.player ??
        (m.current
          ? {
              progressMs: (m.current as any).progressMs ?? (m.current as any).progress_ms,
              durationMs: (m.current as any).durationMs ?? (m.current as any).duration_ms,
              isPlaying: (m.current as any).isPlaying ?? (m.current as any).is_playing,
            }
          : { isPlaying: false, progressMs: 0, durationMs: 0 });

      setPlayer(p);

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

    const pool =
      (roulette.lastParticipants?.length ? roulette.lastParticipants : roulette.participants) || [];
    if (pool.length === 0) return;

    setSlotNames(pool);
    setSlotIndex(0);
    setFinalName(null);
    setOverlayOpen(true);

    setTimeout(() => startSlotSpin(pool), 150);
  }, [roulette?.lastSpinAt]);

  // ---- Temps musique : player.* + live tick
  const trackKey = useMemo(() => {
    const c = music.current;
    if (!c) return null;
    return c.id || `${c.name}__${c.artist}`;
  }, [music.current]);

  const prevTrackKeyRef = useRef<string | null>(null);

  const [liveProgressMs, setLiveProgressMs] = useState(0);
  const [liveDurationMs, setLiveDurationMs] = useState(0);
  const [livePlaying, setLivePlaying] = useState(true);

  useEffect(() => {
    if (!music.current) {
      prevTrackKeyRef.current = null;
      setLiveProgressMs(0);
      setLiveDurationMs(0);
      setLivePlaying(false);
      return;
    }

    const apiProg = pickMs(player, "progressMs", "progress_ms");
    const apiDur = pickMs(player, "durationMs", "duration_ms");
    const apiPlaying =
      pickBool(player, "isPlaying", "is_playing") ?? pickBool(music.current, "isPlaying", "is_playing");
    if (apiPlaying !== undefined) setLivePlaying(apiPlaying);

    if (prevTrackKeyRef.current !== trackKey) {
      prevTrackKeyRef.current = trackKey;
      setLiveDurationMs(apiDur);
      setLiveProgressMs(apiProg);
      return;
    }

    setLiveDurationMs(apiDur);

    setLiveProgressMs((p) => {
      const delta = Math.abs(p - apiProg);
      if (delta > 2500) return apiProg;
      return p;
    });
  }, [trackKey, player, music.current]);

  useEffect(() => {
    if (!music.current) return;
    if (!liveDurationMs) return;
    if (livePlaying === false) return;

    const t = setInterval(() => {
      setLiveProgressMs((p) => clamp(p + 1000, 0, liveDurationMs));
    }, 1000);

    return () => clearInterval(t);
  }, [trackKey, music.current, liveDurationMs, livePlaying]);

  const currentProgress = liveProgressMs;
  const currentDuration = liveDurationMs;
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
      {/* Overlay roulette -> Roulette de la soif */}
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
              width: "min(980px, 96vw)",
              borderRadius: 28,
              padding: 26,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div style={{ fontSize: 34, fontWeight: 980 }}>🍻 Roulette de la soif</div>
            <div style={{ opacity: 0.65, marginTop: 6 }}>
              {slotRunning ? "Ça tourne…" : finalName ? "Résultat" : "Préparation…"}
            </div>

            <div
              style={{
                marginTop: 18,
                height: 320,
                borderRadius: 22,
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.10)",
                display: "grid",
                placeItems: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  height: 92,
                  background: "rgba(255,255,255,0.08)",
                  borderTop: "1px solid rgba(255,255,255,0.10)",
                  borderBottom: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 0 70px rgba(255,255,255,0.06)",
                }}
              />

              <div style={{ width: "100%", maxWidth: 640, padding: "0 18px" }}>
                {(() => {
                  const n = slotNames.length;
                  if (!n) return <div style={{ opacity: 0.7 }}>Personne</div>;

                  const get = (k: number) => slotNames[(slotIndex + k + n) % n];

                  return (
                    <div>
                      {[-3, -2, -1, 0, 1, 2, 3].map((k) => {
                        const center = k === 0;
                        return (
                          <div
                            key={k}
                            style={{
                              height: 46,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: center ? 980 : 820,
                              fontSize: center ? 40 : 20,
                              opacity: center ? 1 : 0.45,
                              textShadow: center ? "0 0 30px rgba(255,255,255,0.25)" : "none",
                              transform: center ? "scale(1.02)" : "scale(1)",
                              transition: "opacity 120ms linear, transform 120ms linear",
                              letterSpacing: center ? 0.3 : 0,
                            }}
                          >
                            {get(k)}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            {finalName && !slotRunning && (
              <div
                style={{
                  marginTop: 16,
                  fontSize: 28,
                  fontWeight: 980,
                  textAlign: "center",
                  padding: "14px 16px",
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  textShadow: "0 0 24px rgba(255,255,255,0.22)",
                }}
              >
                {finalName}, tu bois ! 🍻
              </div>
            )}

            <div style={{ marginTop: 14, opacity: 0.55, fontSize: 13 }}>(clique pour fermer)</div>
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
                      alignItems: "flex-start",
                    }}
                  >
                    {/* ✅ FIX WRAP: le texte peut aller à la ligne */}
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        lineHeight: 1.35,
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <span style={{ fontWeight: 950 }}>{m.name}</span>
                      <span style={{ opacity: 0.7 }}> : </span>
                      <span style={{ fontWeight: 800 }}>{m.text}</span>
                    </div>

                    <div style={{ fontSize: 13, opacity: 0.6, flex: "none", paddingTop: 2 }}>
                      {hhmm(m.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Roulette summary */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 22,
              padding: 18,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 950 }}>🍻 Roulette de la soif</div>
            <div style={{ marginTop: 8, opacity: 0.8 }}>
              Participants : <strong>{roulette.participants?.length || 0}</strong>
            </div>
            <div style={{ marginTop: 10, opacity: 0.6, fontSize: 13 }}>
              (Participation sur <strong>/roulette</strong>)
            </div>
            <div style={{ marginTop: 12, opacity: 0.7, fontSize: 13 }}>
              Dernier tirage :{" "}
              {roulette.lastSpinAt ? hhmm(roulette.lastSpinAt) : "aucun tirage pour l'instant"}
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
