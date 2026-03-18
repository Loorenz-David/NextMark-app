import React from "react";

interface Props {
  alreadyDone?: boolean;
}

export default function ClientFormSubmitted({ alreadyDone }: Props) {
  if (alreadyDone) {
    return <div>Your information has already been submitted. Thank you!</div>;
  }
  return <div>Thank you! Your information has been received.</div>;
}
