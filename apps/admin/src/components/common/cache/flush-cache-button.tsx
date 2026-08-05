"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/base/api";

type Props = {
  disabled?: boolean;
  service?: string;
  compact?: boolean;
};

export function FlushCacheButton({
  disabled = false,
  service,
  compact = false,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isAll = !service;
  const label = isAll
    ? "Flush all cache"
    : compact
      ? "Flush"
      : `Flush ${service}`;
  const path = isAll ? "/api/cache/flush" : `/api/cache/flush/${service}`;
  const confirm = isAll
    ? "Flush all cache keys? Storefront product/category caches will rebuild on next request."
    : `Flush cache for service "${service}"?`;

  async function run() {
    if (disabled || busy) return;
    if (!window.confirm(confirm)) return;
    setBusy(true);
    setError("");
    setMessage("");
    const res = await apiPost<{ deleted?: number }>(path);
    setBusy(false);
    if (res.status_code !== 200) {
      setError(res.message || "Flush failed");
      return;
    }
    const deleted = res.data?.deleted;
    setMessage(
      typeof deleted === "number"
        ? `Flushed (${deleted} keys)`
        : "Flushed successfully",
    );
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => void run()}
        className={`cursor-pointer text-[11px] font-semibold tracking-[0.12em] uppercase transition-opacity disabled:cursor-not-allowed disabled:opacity-50 hover:enabled:opacity-90 ${
          compact
            ? "border border-line px-3 py-1.5 text-mute hover:border-ink/40 hover:text-ink"
            : "bg-ink px-4 py-2.5 text-white"
        }`}
      >
        {busy ? "Flushing…" : label}
      </button>
      {message ? <p className="text-xs text-mute">{message}</p> : null}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
