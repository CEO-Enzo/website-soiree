// app/page.tsx
import Link from "next/link";
import ClientCountdown from "./client-countdown";
import QuickNavCards from "./QuickNavCards";

export default function Home() {
  const title = process.env.NEXT_PUBLIC_SITE_TITLE || "Midnight Vibes";
  const eventIso = process.env.NEXT_PUBLIC_EVENT_DATE || "2026-01-24T19:00:00+01:00";

  const address = "1 Pl. des Canadiens, 14280 Authie";
  const lat = 49.2066;
  const lng = -0.3699;

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

        <div className="hero">
          <div className="hero-inner">
            <h1 className="h1">{title}</h1>
            <p className="p">Samedi 24/01 • à partir de 19h • accès privé</p>

            <div className="chips">
              <span className="chip">🥂 Boissons & snacks</span>
              <span className="chip">🎶 Musique</span>
              <span className="chip">📍 Authie (14)</span>
              <span className="chip">👗 Thème : à définir</span>
            </div>

            <div style={{ height: 16 }} />
            <QuickNavCards address={address} lat={lat} lng={lng} mode="hero" />
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div className="grid2">
          <div className="card">
            <div className="section-title">Compte à rebours</div>
            <ClientCountdown eventIso={eventIso} />
            <div className="small" style={{ marginTop: 10 }}>
              ⏳ Hâte de vous voir tous • n'oubliez pas de confirmer votre présence !
            </div>
          </div>

          <div className="card">
            <div className="section-title">Infos clés</div>

            <QuickNavCards
              address={address}
              lat={lat}
              lng={lng}
              placeName="Salle 37 de Authie"
              mode="cards"
            />

            <div className="sep" />

            <div className="small">
              🅿️ Parking facile autour de la place • merci de respecter le voisinage.
            </div>

            <div style={{ height: 10 }} />
            <Link className="btn" href="/infos">Voir les infos pratiques</Link>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div className="card">
          <div className="section-title">Programme</div>
          <div className="timeline">
            <div className="step">
              <div className="dot" />
              <div>
                <div className="time">19h00 — Arrivées</div>
                <div className="desc">On se pose, apéro, présentation des gens.</div>
              </div>
            </div>
            <div className="step">
              <div className="dot" />
              <div>
                <div className="time">20h30 — Ambiance</div>
                <div className="desc">Musique, jeux, photos, etc.</div>
              </div>
            </div>
            <div className="step">
              <div className="dot" />
              <div>
                <div className="time">23h00 — Respect du voisinage</div>
                <div className="desc">On baisse le son (un peu 😄).</div>
              </div>
            </div>
          </div>

          <div style={{ height: 12 }} />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="btn" href="/todo">Je regarde quoi ramener</Link>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div className="card">
          <div className="section-title">FAQ</div>
          <div className="faq">
            <details>
              <summary>Je ramène quelque chose ?</summary>
              <p>Si tu veux aider : check la page To-do. On met tout là (glaçons, soft, gobelets…).</p>
            </details>
            <details>
              <summary>Thème / dress code ?</summary>
              <p>À définir. On peut mettre “chic”, “néon”, “années 2000”…</p>
            </details>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div className="small" style={{ opacity: 0.7 }}>
          © Soirée privée • Salle 37 de Authie • {address} • merci de respecter le voisinage 🫶
        </div>
      </div>
    </div>
  );
}
