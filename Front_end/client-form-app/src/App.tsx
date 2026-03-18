import React from "react";
import ClientFormPage from "./features/clientForm/ClientFormPage";

// Token is read from the URL path: /form/<token>
// e.g. https://forms.nextmark.app/form/abc123...
function getTokenFromPath(): string | null {
  const match = window.location.pathname.match(/\/form\/([^/]+)/);
  return match ? match[1] : null;
}

export default function App() {
  const token = getTokenFromPath();

  if (!token) {
    return <div>Invalid link. Please check the URL you received.</div>;
  }

  return <ClientFormPage token={token} />;
}
