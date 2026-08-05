"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiDelete } from "@/base/api";

type Props = {
  href: string;
  confirmLabel?: string;
  disabled?: boolean;
  disabledHint?: string;
};

export function DeleteActionButton({
  href,
  confirmLabel = "Delete this item?",
  disabled = false,
  disabledHint,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (disabled || busy) return;
    if (!window.confirm(confirmLabel)) return;
    setBusy(true);
    setError("");
    const res = await apiDelete(href);
    setBusy(false);
    if (res.status_code !== 200) {
      setError(res.message || "Delete failed");
      return;
    }
    router.refresh();
  }

  if (disabled) {
    return (
      <span
        className="text-[11px] font-semibold tracking-[0.1em] uppercase text-mute"
        title={disabledHint}
      >
        —
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={() => void remove()}
        className="cursor-pointer border border-line px-3 py-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-mute transition-colors hover:border-ink/40 hover:text-ink disabled:opacity-50"
      >
        {busy ? "Deleting…" : "Delete"}
      </button>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
