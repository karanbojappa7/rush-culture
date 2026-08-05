"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

type Props = {
  param?: string;
  placeholder?: string;
  className?: string;
  delayMs?: number;
  label?: string;
};

export function DebouncedSearch({
  param = "q",
  placeholder = "Search…",
  className = "",
  delayMs = 350,
  label = "Search",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlValue = searchParams.get(param) ?? "";
  const [value, setValue] = useState(urlValue);
  const debounced = useDebounce(value, delayMs);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setValue(urlValue);
  }, [urlValue]);

  useEffect(() => {
    if (debounced === urlValue) return;
    const next = new URLSearchParams(searchParams.toString());
    if (debounced.trim()) next.set(param, debounced.trim());
    else next.delete(param);
    next.delete("page");
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    });
  }, [debounced, urlValue, param, pathname, router, searchParams]);

  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1 block text-[11px] font-medium tracking-[0.12em] uppercase text-mute">
        {label}
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={`h-10 w-full border border-line bg-panel px-3 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-mute/70 focus:border-ink focus:shadow-[0_0_0_3px_rgba(20,20,20,0.06)] ${
          pending ? "opacity-80" : ""
        }`}
      />
    </label>
  );
}
