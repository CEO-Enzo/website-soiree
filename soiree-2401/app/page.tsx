import Link from "next/link";
import ClientCountdown from "./client-countdown";

export default function Home() {
  const title = process.env.NEXT_PUBLIC_SITE_TITLE || "Midnight Vibes";
  const maps = process.env.NEXT_PUBLIC_GOOGLE_MAPS_LINK || "#";
  const eventIso = process.env.NEXT_PUBLIC_EVENT_DATE || "2026-01-24T19:00:00+01:00";

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
          <h1 className="h1">{title}</h1>
          <p className="p">Samedi 24/01 • à partir de 19h • accès privé</p>

          <div className="sep" />

          <p className="small" style={{ marginBottom: 10 }}>Compte à rebours</p>
          <ClientCountdown eventIso={eventIso} />

          <div style={{ height: 14 }} />

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="btn" href="/rsvp">Répondre (RSVP)</Link>
            <a className="btn" href={maps} target="_blank" rel="noreferrer">Ouvrir le lieu</a>
          </div>

          <div style={{ height: 12 }} />
          <p className="small">Thème : à définir • détails sur la page Infos</p>
        </div>
      </div>
    </div>
  );
}
