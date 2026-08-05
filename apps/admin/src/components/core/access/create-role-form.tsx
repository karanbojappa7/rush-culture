"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPost } from "@/base/api";

export function CreateRoleForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const res = await apiPost<{ id: string }>("/api/roles", {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || undefined,
    });
    setBusy(false);
    if (res.status_code !== 200 || !res.data?.id) {
      setError(res.message || "Failed to create role");
      return;
    }
    setCode("");
    setName("");
    setDescription("");
    router.push("/access/permissions");
    router.refresh();
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-3 border border-line bg-panel p-4">
      <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-mute">
        Create role
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="block text-xs">
          <span className="text-mute">Code</span>
          <input
            required
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="OPS_LEAD"
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-ink"
          />
        </label>
        <label className="block text-xs">
          <span className="text-mute">Name</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ops lead"
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <label className="block text-xs">
          <span className="text-mute">Description</span>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional"
            className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="cursor-pointer bg-ink px-4 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-white disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create"}
        </button>
        {error ? <span className="text-xs text-red-700">{error}</span> : null}
      </div>
    </form>
  );
}
