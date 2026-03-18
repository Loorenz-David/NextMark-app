import { ClientFormPage } from "./features/clientForm/pages/ClientFormPage";

// Token is read from the URL path: /form/<token>
function getTokenFromPath(): string | null {
  const match = window.location.pathname.match(/\/form\/([^/]+)/);
  return match ? match[1] : null;
}

export default function App() {
  const token = getTokenFromPath();

  if (!token) {
    return (
      <main className="mx-auto flex w-full max-w-3xl px-4 py-8">
        <p className="text-sm text-[var(--color-muted)]">Invalid link. Please check the URL you received.</p>
      </main>
    );
  }

  return <ClientFormPage token={token} />;
}
