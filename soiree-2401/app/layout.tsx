import "./globals.css";

export const metadata = {
  title: process.env.NEXT_PUBLIC_SITE_TITLE || "Soirée",
  description: "Invitation privée",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
        {children}
      </body>
    </html>
  );
}
