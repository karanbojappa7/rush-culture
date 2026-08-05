import { Suspense, type ReactNode } from "react";
import { DebouncedSearch } from "@/components/ui/debounced-search";

type Props = {
  total: number;
  noun: string;
  placeholder?: string;
  actions?: ReactNode;
  filters?: ReactNode;
};

function SearchFallback() {
  return (
    <div className="h-[42px] min-w-0 flex-1 animate-pulse border border-line bg-panel sm:max-w-md" />
  );
}

export function ListToolbar({
  total,
  noun,
  placeholder = "Search…",
  actions,
  filters,
}: Props) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Suspense fallback={<SearchFallback />}>
          <DebouncedSearch placeholder={placeholder} className="sm:max-w-md" />
        </Suspense>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
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
