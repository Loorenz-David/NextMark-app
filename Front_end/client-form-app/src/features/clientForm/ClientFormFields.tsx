import React from "react";
import { useForm } from "react-hook-form";
import { ClientFormMeta, ClientFormPayload } from "./types";
import { submitClientForm } from "../../api/clientForm.api";

interface Props {
  token: string;
  meta: ClientFormMeta;
  onSubmitted: () => void;
}

// TODO: add field-level validation, address sub-fields, styling
export default function ClientFormFields({ token, meta, onSubmitted }: Props) {
  const { register, handleSubmit, formState } = useForm<ClientFormPayload>();

  const onSubmit = async (data: ClientFormPayload) => {
    // TODO: handle API errors gracefully
    await submitClientForm(token, data);
    onSubmitted();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Order {meta.reference_number}</h1>
      <p>Requested by {meta.team_name}</p>

      {/* TODO: replace with proper form UI components */}
      <input {...register("client_first_name", { required: true })} placeholder="First name" />
      <input {...register("client_last_name", { required: true })} placeholder="Last name" />
      <input {...register("client_email", { required: true })} placeholder="Email" type="email" />
      <input {...register("client_primary_phone", { required: true })} placeholder="Phone" />
      <input {...register("client_secondary_phone")} placeholder="Secondary phone (optional)" />

      {/* TODO: expand client_address into street / city / postal_code / country fields */}

      <button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}
