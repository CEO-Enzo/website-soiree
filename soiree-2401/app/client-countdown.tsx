"use client";

import { useEffect, useMemo, useState } from "react";

export default function ClientCountdown({ eventIso }: { eventIso: string }) {
  const target = useMemo(() => new Date(eventIso).getTime(), [eventIso]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, target - now);
  const totalSeconds = Math.floor(diff / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const ended = diff === 0;

  if (ended) {
    return (
      <div className="card" style={{ padding: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>C’est parti 🎉</div>
        <div className="small" style={{ marginTop: 6 }}>
          La soirée a commencé.
        </div>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        padding: 16,
        borderRadius: 18,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        <TimeBox label="Jours" value={days} />
        <TimeBox label="Heures" value={hours} />
        <TimeBox label="Minutes" value={mins} />
        <TimeBox label="Secondes" value={secs} />
      </div>
    </div>
  );
}

function TimeBox({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        border: "1px solid var(--border)",
        background: "rgba(255,255,255,0.06)",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>
        {String(value).padStart(2, "0")}
      </div>
      <div className="small" style={{ marginTop: 6 }}>
        {label}
      </div>
    </div>
  );
}
