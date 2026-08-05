"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiDelete, apiPatch } from "@/base/api";

type Props = {
  id: string;
  isApproved: boolean;
};

export function ReviewModerationActions({ id, isApproved }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function approve() {
    setBusy(true);
    setError("");
    const res = await apiPatch(`/api/reviews/${id}/approve`);
    setBusy(false);
    if (res.status_code !== 200) {
      setError(res.message || "Approve failed");
      return;
    }
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    setError("");
    const res = await apiDelete(`/api/reviews/${id}`);
    setBusy(false);
    if (res.status_code !== 200) {
      setError(res.message || "Delete failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2">
        {!isApproved ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void approve()}
            className="cursor-pointer bg-ink px-3 py-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-white disabled:opacity-50"
          >
            Approve
          </button>
        ) : (
          <span className="px-2 py-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-mute">
            Approved
          </span>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => void remove()}
          className="cursor-pointer border border-line px-3 py-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-mute hover:text-ink disabled:opacity-50"
        >
          Delete
        </button>
      </div>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
