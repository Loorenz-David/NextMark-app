import { ClientFormMeta, ClientFormPayload } from "../features/clientForm/types";

const BASE = "/api/v2/public/client-form";

export async function fetchClientForm(token: string): Promise<ClientFormMeta> {
  // TODO: implement — GET ${BASE}/${token}
  throw new Error("Not implemented");
}

export async function submitClientForm(
  token: string,
  payload: ClientFormPayload
): Promise<void> {
  // TODO: implement — POST ${BASE}/${token}
  throw new Error("Not implemented");
}
