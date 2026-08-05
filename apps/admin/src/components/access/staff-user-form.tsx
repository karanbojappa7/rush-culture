"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPost } from "@/lib/api";

type RoleOption = { code: string; name: string };

type Props = {
  roles: RoleOption[];
};

export function StaffUserForm({ roles }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [roleCode, setRoleCode] = useState(roles[0]?.code ?? "STAFF");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const res = await apiPost("/api/users", {
      email: email.trim().toLowerCase(),
      name: name.trim() || undefined,
      password: password || undefined,
      roleCode,
      userTypeCode: "INTERNAL",
    });
    setBusy(false);
    if (res.status_code !== 200) {
      setError(res.message || "Failed to create user");
      return;
    }
    setMessage("Staff user created");
    setEmail("");
    setName("");
    setPassword("");
    router.refresh();
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="grid gap-3 border border-line bg-panel p-4 md:grid-cols-4"
    >
      <label className="block text-xs">
        <span className="text-mute">Email</span>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </label>
      <label className="block text-xs">
        <span className="text-mute">Name</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </label>
      <label className="block text-xs">
        <span className="text-mute">Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </label>
      <label className="block text-xs">
        <span className="text-mute">Role</span>
        <select
          value={roleCode}
          onChange={(event) => setRoleCode(event.target.value)}
          className="mt-1 w-full border border-line bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-ink"
        >
          {roles.map((role) => (
            <option key={role.code} value={role.code}>
              {role.name} ({role.code})
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-3 md:col-span-4">
        <button
          type="submit"
          disabled={busy}
          className="cursor-pointer bg-ink px-4 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-white disabled:opacity-50"
        >
          {busy ? "Creating…" : "Add staff"}
        </button>
        {message ? (
          <span className="text-xs text-mute">{message}</span>
        ) : null}
        {error ? <span className="text-xs text-red-700">{error}</span> : null}
      </div>
    </form>
  );
}
