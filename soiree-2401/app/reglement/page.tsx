// app/reglement/page.tsx
import Link from "next/link";

const ARTICLES: { title: string; lines: string[] }[] = [
  {
    title: "Article 1 – Objet",
    lines: [
      "Le présent règlement fixe les conditions de mise à disposition de la Salle 37.",
      "Toute réservation implique l’acceptation sans réserve du présent règlement.",
    ],
  },
  {
    title: "Article 2 – Condition de location",
    lines: [
      "La salle est louée aux particuliers althavillais uniquement, associations, pour des manifestations privées, culturelles, associatives ou familiales.",
      "La location est subordonnée à la signature d’un contrat, au versement de la location et au versement d’une caution, d’un montant de 500 €.",
      "Vous devez respecter le voisinage, le volume sonore devra être modéré, à partir de 23h.",
      "Le locataire reste juridiquement responsable et devra être joignable à tout moment.",
    ],
  },
  {
    title: "Article 3 – Réservation",
    lines: [
      "La réservation est enregistrée après signature du contrat et versement du paiement de la location et de la caution.",
    ],
  },
  {
    title: "Article 4 – Tarifs",
    lines: [
      "Les tarifs de location sont fixés annuellement par délibération du Conseil Municipal.",
    ],
  },
  {
    title: "Article 5 – Assurance",
    lines: [
      "Le locataire doit fournir une attestation d’assurance responsabilité civile couvrant la période de location, dès la signature du contrat.",
    ],
  },
  {
    title: "Article 6 – Capacité et sécurité",
    lines: [
      "La capacité maximale autorisée de la salle est fixée à 70 personnes assises ou 150 personnes debout.",
      "Les issues de secours doivent rester dégagées en permanence.",
      "Il est interdit d’introduire des matières dangereuses, inflammables ou explosives.",
    ],
  },
  {
    title: "Article 7 – Niveau sonore",
    lines: [
      "Il est interdit de diffuser de la musique à l’extérieur.",
      "Le locataire doit veiller à limiter les nuisances sonores afin de respecter le voisinage.",
      "Les ouvrants devront rester fermés dès 23h.",
    ],
  },
  {
    title: "Article 8 – Installations électriques et techniques",
    lines: [
      "Il est formellement interdit de modifier les installations électriques, de retirer ou de forcer les dispositifs de sécurité ou de protection (plombs, disjoncteurs, etc…).",
      "Toute dégradation ou intervention non autorisée entraînera la perte de la caution et donnera lieu à des poursuites.",
    ],
  },
  {
    title: "Article 9 – Caution",
    lines: [
      "Une caution de 500 € est exigée.",
      "Elle sera restituée, dans un délai de 8 jours, après l’état des lieux de sortie, déduction faite, le cas échéant, des frais de remise en état, de nettoyage ou de réparations.",
      "En cas de plainte dûment constatée dans les 7 jours suivant la manifestation (voisinage, force de l’ordre, mairie), la commune conservera la totalité de la caution.",
      "En cas de non-respect du règlement, la caution sera retenue.",
    ],
  },
  {
    title: "Article 10 – Propreté et remise en état",
    lines: [
      "La salle, les sanitaires, la cuisine et les abords doivent être laissés propres.",
      "Les déchets doivent être triés et déposés dans les containers prévus.",
      "En cas de non-respect, les frais de nettoyage seront déduits de la caution.",
    ],
  },
  {
    title: "Article 11 – Responsabilité du locataire",
    lines: [
      "Le locataire est responsable de l’ordre, de la sécurité et du bon déroulement de la manifestation.",
      "Il est civilement et financièrement responsable de tous les dommages causés aux locaux, au matériel et aux tiers.",
    ],
  },
  {
    title: "Article 12 – Interdictions diverses",
    lines: [
      "Il est interdit de fumer et de vapoter à l’intérieur de la salle.",
      "Les animaux ne sont pas admis, sauf chiens guides et d’assistance.",
      "Toute affichage ou décoration doit être retiré sans dégradation des murs et équipements.",
      "Rappel : les ouvrants devront rester fermés à partir de 23h.",
      "Le locataire veillera à respecter les extérieurs. Il est interdit de pénétrer dans la cour de l’école. Le locataire est responsable de la discipline intérieure et extérieure.",
    ],
  },
  {
    title: "Article 13 – États des lieux",
    lines: [
      "Un état des lieux d’entrée et de sortie est réalisé conjointement avec une représentante de la mairie.",
      "Toute anomalie constatée pourra entraîner une retenue sur la caution.",
    ],
  },
  {
    title: "Article 14 – Application du règlement",
    lines: [
      "Le présent règlement sera affiché dans la salle et remis à chaque locataire.",
      "Le non-respect de ces dispositions pourra entraîner la suspension du droit de location pour les contrevenants.",
    ],
  },
  {
    title: "Article 15 – Associations",
    lines: [
      "Les associations qui organisent une manifestation payante ou gratuite, qui diffusent de la musique doivent respecter la réglementation, en vigueur.",
      "En cas de vente de boissons, suivant la catégorie, l’association devra effectuer une demande d’ouverture de débit de boissons, auprès de la mairie.",
    ],
  },
  {
    title: "Article 16 – Scène",
    lines: ["L’utilisation de la scène est strictement INTERDITE."],
  },
];

export default function ReglementPage() {
  return (
    <div className="bg">
      <div className="container">
        <nav>
          <Link className="btn" href="/">Accueil</Link>
          <Link className="btn" href="/infos">Infos</Link>
          <Link className="btn" href="/todo">To-do</Link>
          <Link className="btn" href="/musique">Musique</Link>
          <Link className="btn" href="/messages">Messages</Link>
          <Link className="btn" href="/reglement">Règlement</Link>
        </nav>

        <div style={{ height: 18 }} />

        <div className="card">
          <h1 className="h1" style={{ fontSize: 36 }}>Règlement de la salle</h1>
          <p className="p">Salle 37 de Authie — à respecter pendant toute la soirée.</p>

          <div className="sep" />

          <div className="faq">
            {ARTICLES.map((a) => (
              <details key={a.title} open={false}>
                <summary>{a.title}</summary>
                <div style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {a.lines.map((l, idx) => (
                      <li key={idx}>{l}</li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>

          <div style={{ height: 14 }} />
          <div className="small" style={{ opacity: 0.8 }}>
            Astuce : garde surtout en tête “ouvrants fermés dès 23h”, “pas de musique dehors” et “propreté”.
          </div>
        </div>
      </div>
    </div>
  );
}
