"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import type { ContactTopic, ContactTopicValue } from "@linq/site-config";
import { apiPost } from "@/base/api";

export function ContactForm({ topics }: { topics: ContactTopic[] }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [topic, setTopic] = useState<ContactTopicValue>(
    topics[0]?.value ?? "SHIPPING",
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone") || "") || undefined,
      topic,
      subject: String(form.get("subject")),
      message: String(form.get("message")),
      orderNumber: String(form.get("orderNumber") || "") || undefined,
    };
    const res = await apiPost("/api/customer-queries", payload);
    if (res.status_code !== 200) {
      setError(res.message || "Could not submit query");
      setSubmitting(false);
      return;
    }
    setDone(true);
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="border border-line bg-mist/40 p-8">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Query received
        </h2>
        <p className="mt-3 text-mute">
          Thanks — our team tracks every request in admin and will reply by
          email.
        </p>
        <Link href="/shop" className="btn-primary mt-6 inline-flex">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="name" label="Name" required />
        <Field name="email" label="Email" type="email" required />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="phone" label="Phone" type="tel" />
        <Field name="orderNumber" label="Order number" />
      </div>
      <div>
        <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
          Topic
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {topics.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTopic(item.value)}
              className={`cursor-pointer px-3 py-2 text-sm font-medium ${
                topic === item.value
                  ? "bg-ink text-paper"
                  : "bg-mist text-ink hover:bg-ink hover:text-paper"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <Field name="subject" label="Subject" required />
      <div>
        <label
          htmlFor="message"
          className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          className="mt-2 min-h-36 w-full border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="cursor-pointer bg-volt px-6 py-3 text-[13px] font-bold tracking-[0.14em] uppercase text-volt-ink disabled:opacity-50"
      >
        {submitting ? "Sending…" : "Submit query"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-ink"
      />
    </div>
  );
}
