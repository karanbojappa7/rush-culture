"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPatch } from "@/base/api";

const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export function QueryStatusForm({
  id,
  status,
  adminNote,
}: {
  id: string;
  status: string;
  adminNote: string | null;
}) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState(status);
  const [note, setNote] = useState(adminNote ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSave() {
    setSaving(true);
    setError("");
    const res = await apiPatch(`/api/customer-queries/${id}`, {
      status: nextStatus,
      adminNote: note || undefined,
    });
    if (res.status_code !== 200) {
      setError(res.message || "Update failed");
      setSaving(false);
      return;
    }
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-4 border border-line bg-panel p-5">
      <div>
        <label className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
          Status
        </label>
        <select
          value={nextStatus}
          onChange={(e) => setNextStatus(e.target.value)}
          className="mt-2 w-full border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-ink"
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
          Admin note
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-2 min-h-28 w-full border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-ink"
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="button"
        disabled={saving}
        onClick={() => void onSave()}
        className="cursor-pointer bg-ink px-5 py-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : "Update query"}
      </button>
    </div>
  );
}
