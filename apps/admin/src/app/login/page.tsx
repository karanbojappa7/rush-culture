"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { brand } from "@linq/site-config";
import { apiPost } from "@/base/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await apiPost<{ user: { email: string } }>("/api/auth/login", {
      email,
      password,
    });
    setSubmitting(false);
    if (res.status_code !== 200) {
      setError(res.message || "Login failed");
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md border border-line bg-panel p-8"
      >
        <p className="font-display text-3xl font-extrabold tracking-tight text-ink">
          {brand.name}
        </p>
        <p className="mt-1 text-[12px] tracking-[0.14em] uppercase text-mute">
          {brand.adminLabel} login
        </p>
        <label className="mt-8 block text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
        </label>
        <label className="mt-4 block text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
        </label>
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="mt-8 w-full cursor-pointer bg-ink py-3.5 text-[13px] font-semibold tracking-[0.12em] uppercase text-white disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
