// app/infos/page.tsx
import Link from "next/link";
import QuickNavCards from "../QuickNavCards";

export default function InfosPage() {
  const address = "1 Pl. des Canadiens, 14280 Authie";
  const lat = 49.2066;
  const lng = -0.3699;

  return (
    <div className="bg">
      <div className="container">
        {/* NAVBAR */}
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

        {/* PAGE */}
        <div className="card">
          <h1 className="h1" style={{ fontSize: 36 }}>
            Infos pratiques
          </h1>
          <p className="p">
            Samedi 24/01 • à partir de 19h • Salle 37 de Authie
          </p>

          <div className="sep" />

          {/* ACCÈS */}
          <div className="grid2">
            <div className="card">
              <div className="section-title">Accès</div>
              <p className="small">
                Lieu : <strong>Salle 37 de Authie</strong>
              </p>

              {/* Boutons principaux (S’y rendre UNIQUEMENT ici) */}
              <QuickNavCards
                address={address}
                lat={lat}
                lng={lng}
                placeName="Salle 37 de Authie"
                mode="hero"
              />
            </div>

            <div className="card">
              <div className="section-title">Thème / dress code</div>
              <p className="p">CHIC</p>
              <p className="small">
  Ambiance chill ✨  
  Venez bien habillés, posez-vous, faites-vous plaisir — pas besoin d’en faire trop, 
  mais un petit effort sur la tenue fait toujours la diff 😉
              </p>
            </div>
          </div>

          <div style={{ height: 16 }} />

          {/* PARKING */}
          <div className="card">
            <div className="section-title">🅿️ Parking</div>
            <ul style={{ marginTop: 10, lineHeight: 1.6 }}>
              <li>Parking possible autour de la place</li>
              <li>Petit parking en face de la mairie</li>
              <li>Merci de ne pas bloquer les accès</li>
            </ul>
          </div>

          <div style={{ height: 16 }} />

          {/* RÈGLES IMPORTANTES */}
          <div className="card">
            <div className="section-title">Règles importantes</div>
            <ul style={{ marginTop: 10, lineHeight: 1.6 }}>
              <li>Arrivée libre à partir de 19h</li>
              <li>À partir de 23h : volume réduit</li>
              <li>Pas de cris ou musique dehors</li>
              <li>Merci de respecter le voisinage</li>
              <li>Merci de laisser la salle propre</li>
            </ul>
          </div>

          <div style={{ height: 16 }} />

          {/* LIEN RÈGLEMENT */}
          <div className="card">
            <div className="section-title">Règlement de la salle</div>
            <p className="small">
              Le règlement complet de la salle est disponible ici :
            </p>
            <div style={{ marginTop: 10 }}>
              <Link className="btn" href="/reglement">
                Voir le règlement
              </Link>
            </div>
          </div>
        </div>

        <div style={{ height: 16 }} />

        {/* FOOTER */}
        <div className="small" style={{ opacity: 0.7 }}>
          © Soirée privée • Salle 37 de Authie • merci de respecter le lieu et le voisinage 🫶
        </div>
      </div>
    </div>
  );
}
