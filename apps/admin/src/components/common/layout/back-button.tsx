"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  href?: string;
  label?: string;
};

export function BackButton({ href, label = "Back" }: Props) {
  const router = useRouter();

  if (href) {
    return (
      <Link
        href={href}
        className="group inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.1em] uppercase text-mute transition-colors hover:text-ink"
      >
        <span
          aria-hidden
          className="inline-block transition-transform group-hover:-translate-x-0.5"
        >
          ←
        </span>
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="group inline-flex cursor-pointer items-center gap-2 text-[12px] font-semibold tracking-[0.1em] uppercase text-mute transition-colors hover:text-ink"
    >
      <span
        aria-hidden
        className="inline-block transition-transform group-hover:-translate-x-0.5"
      >
        ←
      </span>
      {label}
    </button>
  );
}
