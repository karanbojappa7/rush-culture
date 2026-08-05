import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
};

export function PaginationNav({
  page,
  totalPages,
  total,
  basePath,
  searchParams = {},
}: Props) {
  if (totalPages <= 1) {
    return (
      <p className="mt-4 text-sm text-mute">
        {total} {total === 1 ? "item" : "items"}
      </p>
    );
  }

  function href(nextPage: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set("page", String(nextPage));
    const qs = params.toString();
    return `${basePath}?${qs}`;
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-mute">
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={href(page - 1)}
            className="cursor-pointer border border-line px-3 py-2 text-[12px] font-semibold tracking-[0.1em] uppercase hover:bg-panel"
          >
            Previous
          </Link>
        ) : (
          <span className="border border-line px-3 py-2 text-[12px] font-semibold tracking-[0.1em] uppercase text-mute opacity-40">
            Previous
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={href(page + 1)}
            className="cursor-pointer border border-line bg-ink px-3 py-2 text-[12px] font-semibold tracking-[0.1em] uppercase text-white"
          >
            Next
          </Link>
        ) : (
          <span className="border border-line px-3 py-2 text-[12px] font-semibold tracking-[0.1em] uppercase text-mute opacity-40">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
