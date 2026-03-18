import React, { useEffect, useState } from "react";
import { ClientFormStatus } from "./types";
import { fetchClientForm } from "../../api/clientForm.api";
import ClientFormFields from "./ClientFormFields";
import ClientFormSubmitted from "./ClientFormSubmitted";
import ClientFormExpired from "./ClientFormExpired";

interface Props {
  token: string;
}

// TODO: add styling / branding
export default function ClientFormPage({ token }: Props) {
  const [status, setStatus] = useState<ClientFormStatus>({ state: "loading" });

  useEffect(() => {
    fetchClientForm(token)
      .then((meta) => setStatus({ state: "ready", meta }))
      .catch((err) => {
        // TODO: distinguish expired / already_submitted / invalid from API error codes
        setStatus({ state: "invalid" });
      });
  }, [token]);

  if (status.state === "loading") return <div>Loading…</div>;
  if (status.state === "expired") return <ClientFormExpired />;
  if (status.state === "already_submitted") return <ClientFormSubmitted alreadyDone />;
  if (status.state === "submitted") return <ClientFormSubmitted />;
  if (status.state === "invalid") return <div>This link is not valid.</div>;

  return (
    <ClientFormFields
      token={token}
      meta={status.meta}
      onSubmitted={() => setStatus({ state: "submitted" })}
    />
  );
}
