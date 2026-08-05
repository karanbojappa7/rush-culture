import { Suspense, type ReactNode } from "react";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { DebouncedSearch } from "@/components/ui/debounced-search";

type Props = {
  total: number;
  noun: string;
  placeholder?: string;
  actions?: ReactNode;
  filters?: ReactNode;
  showDateRange?: boolean;
};

function SearchFallback() {
  return (
    <div className="min-w-0 flex-1 sm:max-w-sm">
      <div className="mb-1 h-[14px]" />
      <div className="h-10 animate-pulse border border-line bg-panel" />
    </div>
  );
}

function DateFallback() {
  return (
    <div className="flex items-end gap-2">
      <div>
        <div className="mb-1 h-[14px]" />
        <div className="h-10 w-[148px] animate-pulse border border-line bg-panel" />
      </div>
      <div>
        <div className="mb-1 h-[14px]" />
        <div className="h-10 w-[148px] animate-pulse border border-line bg-panel" />
      </div>
      <div className="h-10 w-16 animate-pulse border border-line bg-panel" />
    </div>
  );
}

export function ListToolbar({
  total,
  noun,
  placeholder = "Search…",
  actions,
  filters,
  showDateRange = true,
}: Props) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <Suspense fallback={<SearchFallback />}>
            <DebouncedSearch
              placeholder={placeholder}
              className="w-full min-w-[12rem] flex-1 sm:max-w-sm"
            />
          </Suspense>
          {showDateRange ? (
            <Suspense fallback={<DateFallback />}>
              <DateRangeFilter />
            </Suspense>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-col items-stretch gap-1 sm:items-end">
            <div className="hidden xl:block xl:h-[18px]" aria-hidden />
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-mute">
          {total} {noun}
        </p>
        {filters}
      </div>
    </div>
  );
}
