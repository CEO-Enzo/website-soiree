import Link from "next/link";

export default function InfosPage() {
  const maps = process.env.NEXT_PUBLIC_GOOGLE_MAPS_LINK || "#";

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
          <h1 className="h1" style={{ fontSize: 34 }}>Infos pratiques</h1>
          <p className="p">Samedi 24/01 • à partir de 19h</p>

          <div className="sep" />

          <div className="grid2">
            <div className="card">
              <div className="small">Lieu</div>
              <div style={{ marginTop: 8 }}>
                <a className="btn" href={maps} target="_blank" rel="noreferrer">Ouvrir Google Maps</a>
              </div>
              <div style={{ height: 10 }} />
              <div className="small">Tu peux ajouter une adresse précise + instructions plus tard.</div>
            </div>

            <div className="card">
              <div className="small">Thème / dress code</div>
              <div style={{ marginTop: 8, fontSize: 16 }}>À définir</div>
              <div style={{ height: 10 }} />
              <div className="small">Ex: Chic / Casual / Néon / Années 2000…</div>
            </div>
          </div>

          <div style={{ height: 12 }} />
          <div className="card">
            <div className="small">Rappels</div>
            <ul style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>
              <li>Arrivée à partir de 19h</li>
              <li>Indique le nombre de personnes sur le RSVP</li>
              <li>Ajoute ici parking / interphone / code si besoin</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
