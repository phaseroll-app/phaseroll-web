"use client";

import { useId, useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

type WaitlistFormProps = {
  source: string;
  size?: "default" | "large";
  note?: boolean;
};

export function WaitlistForm({
  source,
  size = "default",
  note = false,
}: WaitlistFormProps) {
  const emailId = useId();
  const companyId = useId();
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, source }),
      });
      const data = (await response.json()) as { ok?: boolean };
      setStatus(response.ok && data.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="success" role="status">
        <p className="success__head">You&rsquo;re on the roll.</p>
        <p className="success__body mute">
          We&rsquo;ll email you when the first phase opens.
        </p>
      </div>
    );
  }

  return (
    <form
      className={size === "large" ? "form form--large" : "form"}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="form__row">
        <label className="visually-hidden" htmlFor={emailId}>
          Email address
        </label>
        <input
          className="form__input"
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="you@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <div className="honeypot" aria-hidden="true">
          <label htmlFor={companyId}>Company</label>
          <input
            id={companyId}
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
        </div>

        <button
          className="form__button"
          type="submit"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Sending" : "Join the waitlist"}
        </button>
      </div>

      {note ? (
        <p className="form__note caption">No spam. One email when we launch.</p>
      ) : null}

      <p className="form__error" role="alert">
        {status === "error" ? "That didn’t send. Try again in a moment." : ""}
      </p>
    </form>
  );
}
