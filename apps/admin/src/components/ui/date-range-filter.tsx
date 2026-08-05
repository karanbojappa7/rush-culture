"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  fromParam?: string;
  toParam?: string;
};

const fieldClass =
  "h-10 border border-line bg-panel px-2.5 text-sm outline-none focus:border-ink focus:shadow-[0_0_0_3px_rgba(20,20,20,0.06)]";
const labelClass =
  "mb-1 block text-[11px] font-medium tracking-[0.12em] uppercase text-mute";
const buttonClass =
  "inline-flex h-10 cursor-pointer items-center border border-line px-3 text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors";

export function DateRangeFilter({
  fromParam = "from",
  toParam = "to",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlFrom = searchParams.get(fromParam) ?? "";
  const urlTo = searchParams.get(toParam) ?? "";
  const [from, setFrom] = useState(urlFrom);
  const [to, setTo] = useState(urlTo);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setFrom(urlFrom);
    setTo(urlTo);
  }, [urlFrom, urlTo]);

  function apply(nextFrom: string, nextTo: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (nextFrom) next.set(fromParam, nextFrom);
    else next.delete(fromParam);
    if (nextTo) next.set(toParam, nextTo);
    else next.delete(toParam);
    next.delete("page");
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function clear() {
    setFrom("");
    setTo("");
    apply("", "");
  }

  const dirty = from !== urlFrom || to !== urlTo;
  const hasRange = Boolean(urlFrom || urlTo);

  return (
    <div
      className={`flex flex-wrap items-end gap-2 ${pending ? "opacity-80" : ""}`}
    >
      <label className="block">
        <span className={labelClass}>From</span>
        <input
          type="date"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className={labelClass}>To</span>
        <input
          type="date"
          value={to}
          onChange={(event) => setTo(event.target.value)}
          className={fieldClass}
        />
      </label>
      <button
        type="button"
        onClick={() => apply(from, to)}
        disabled={!dirty}
        className={`${buttonClass} bg-ink text-white disabled:cursor-not-allowed disabled:opacity-40`}
      >
        Apply
      </button>
      {hasRange || dirty ? (
        <button
          type="button"
          onClick={clear}
          className={`${buttonClass} text-mute hover:border-ink/40 hover:text-ink`}
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
