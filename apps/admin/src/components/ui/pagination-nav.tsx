import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
};

function buildHref(
  basePath: string,
  searchParams: Record<string, string | undefined>,
  nextPage: number,
) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  if (nextPage > 1) params.set("page", String(nextPage));
  else params.delete("page");
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function pageWindow(page: number, totalPages: number): number[] {
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let i = page - 1; i <= page + 1; i += 1) {
    if (i >= 1 && i <= totalPages) pages.add(i);
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export function PaginationNav({
  page,
  totalPages,
  total,
  basePath,
  searchParams = {},
}: Props) {
  if (total === 0) {
    return null;
  }

  if (totalPages <= 1) {
    return (
      <p className="mt-4 text-sm text-mute">
        {total} {total === 1 ? "item" : "items"}
      </p>
    );
  }

  const pages = pageWindow(page, totalPages);

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
      <p className="text-sm text-mute">
        Page {page} of {totalPages} · {total} total
      </p>
      <nav className="flex flex-wrap items-center gap-1.5" aria-label="Pagination">
        <Link
          href={buildHref(basePath, searchParams, Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`cursor-pointer border border-line px-3 py-2 text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors ${
            page <= 1
              ? "pointer-events-none text-mute opacity-40"
              : "hover:bg-panel"
          }`}
        >
          Previous
        </Link>
        {pages.map((pageNumber, index) => {
          const prev = pages[index - 1];
          const showEllipsis = prev !== undefined && pageNumber - prev > 1;
          const active = pageNumber === page;
          return (
            <span key={pageNumber} className="contents">
              {showEllipsis ? (
                <span className="px-1 text-mute" aria-hidden>
                  …
                </span>
              ) : null}
              <Link
                href={buildHref(basePath, searchParams, pageNumber)}
                aria-current={active ? "page" : undefined}
                className={`min-w-9 cursor-pointer border px-2.5 py-2 text-center text-[12px] font-semibold transition-colors ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-line hover:bg-panel"
                }`}
              >
                {pageNumber}
              </Link>
            </span>
          );
        })}
        <Link
          href={buildHref(basePath, searchParams, Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={`cursor-pointer border border-line bg-ink px-3 py-2 text-[12px] font-semibold tracking-[0.1em] uppercase text-white transition-opacity ${
            page >= totalPages
              ? "pointer-events-none opacity-40"
              : "hover:opacity-90"
          }`}
        >
          Next
        </Link>
      </nav>
    </div>
  );
}
