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
  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const ended = diff === 0;

  return (
    <div className="card" style={{ padding: 14 }}>
      {ended ? (
        <div style={{ fontSize: 18 }}>C’est parti 🎉</div>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <TimeBox label="Jours" value={days} />
          <TimeBox label="Heures" value={hours} />
          <TimeBox label="Minutes" value={mins} />
          <TimeBox label="Secondes" value={secs} />
        </div>
      )}
    </div>
  );
}

function TimeBox({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ minWidth: 110 }}>
      <div style={{ fontSize: 26, fontWeight: 700 }}>{String(value).padStart(2, "0")}</div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
    </div>
  );
}
