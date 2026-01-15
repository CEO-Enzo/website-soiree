"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  address: string;
  lat: number;
  lng: number;
  placeName?: string;
  mode?: "hero" | "cards";
};

export default function QuickNavCards({
  address,
  lat,
  lng,
  placeName = "Salle 37 de Authie",
  mode = "hero",
}: Props) {
  const geoLink = useMemo(
    () => `geo:${lat},${lng}?q=${encodeURIComponent(address)}`,
    [lat, lng, address]
  );
  const mapsFallback = useMemo(
    () =>
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address
      )}`,
    [address]
  );

  const [toast, setToast] = useState<string | null>(null);

  function isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function goThere(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!isMobile()) {
      e.preventDefault();
      window.open(mapsFallback, "_blank");
    }
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      setToast("Adresse copiée ✅");
      setTimeout(() => setToast(null), 1200);
    } catch {
      setToast("Copie impossible");
      setTimeout(() => setToast(null), 1200);
    }
  }

  // ✅ Bouton S’y rendre (UTILISÉ UNIQUEMENT EN HERO)
  const GoBtn = (
    <a className="btn" href={geoLink} onClick={goThere} style={{ gap: 10 }}>
      <span
        aria-hidden
        style={{
          display: "inline-block",
          animation: "carMove 1.1s ease-in-out infinite",
        }}
      >
        🚗
      </span>
      S’y rendre
      <style>{`
        @keyframes carMove {
          0%   { transform: translateX(0px); opacity: 0.9; }
          50%  { transform: translateX(3px); opacity: 1; }
          100% { transform: translateX(0px); opacity: 0.9; }
        }
      `}</style>
    </a>
  );

const AddressCard = (
  <div
    className="card"
    onClick={copyAddress}
    role="button"
    tabIndex={0}
    style={{ cursor: "pointer" }}
  >
    <div className="kpi">
      <div>🏠</div>
      <div>
        <strong>Adresse</strong>
        <span>{address}</span>
      </div>
    </div>
  </div>
);


  const toastUI = toast ? (
    <div
      className="card"
      style={{
        position: "fixed",
        bottom: 18,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "10px 12px",
        borderRadius: 16,
        zIndex: 50,
      }}
    >
      {toast}
    </div>
  ) : null;

  // =========================
  // HERO MODE → bouton visible
  // =========================
  if (mode === "hero") {
    return (
      <>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn" href="/rsvp">
            Répondre (RSVP)
          </Link>
          {GoBtn}
          <Link className="btn" href="/todo">
            Voir la to-do
          </Link>
        </div>
        {toastUI}
      </>
    );
  }

  // =========================
  // CARDS MODE → PAS DE BOUTON
  // =========================
  return (
    <>
      <div className="grid3">
        {/* LIEU — sans S’y rendre */}
        <div className="card">
          <div className="kpi">
            <div>📍</div>
            <div>
              <strong>Lieu</strong>
              <span>{placeName}</span>
            </div>
          </div>
        </div>

        {AddressCard}

        <div className="card">
          <div className="kpi">
            <div>⏰</div>
            <div>
              <strong>À partir de 19h</strong>
              <span>Arrivées libres</span>
            </div>
          </div>
        </div>
      </div>

      {toastUI}
    </>
  );
}
