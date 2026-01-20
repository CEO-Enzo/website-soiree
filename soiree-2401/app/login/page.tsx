import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="bg"><div className="container">Chargement...</div></div>}>
      <LoginClient />
    </Suspense>
  );
}
