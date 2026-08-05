"use client";

import { useState, useTransition } from "react";
import { apiGet } from "@/lib/api";
import { downloadSpreadsheet, type SpreadsheetFormat } from "@/lib/export-file";
import { pageQuery } from "@/lib/pagination";

type ExportRow = Record<string, string | number | null | undefined>;

type Props = {
  endpoint: string;
  fileBaseName: string;
  filters?: Record<string, string | undefined>;
  columns?: string[];
  mapRows?: (items: ExportRow[]) => ExportRow[];
};

const buttonClass =
  "inline-flex h-10 cursor-pointer items-center border border-line px-3 text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export function ExportMenu({
  endpoint,
  fileBaseName,
  filters = {},
  columns,
  mapRows,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(format: SpreadsheetFormat) {
    setError(null);
    startTransition(async () => {
      const res = await apiGet<{ items: ExportRow[]; total: number }>(
        `${endpoint}${pageQuery(filters)}`,
      );
      if (res.status_code !== 200 || !res.data) {
        setError(res.message || "Export failed");
        return;
      }
      const items = mapRows ? mapRows(res.data.items) : res.data.items;
      if (items.length === 0) {
        setError("Nothing to export for current filters");
        return;
      }
      downloadSpreadsheet(fileBaseName, items, format, columns);
    });
  }

  return (
    <div className="flex flex-col items-stretch gap-1 sm:items-end">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run("csv")}
          className={`${buttonClass} hover:border-ink/40`}
        >
          {pending ? "Exporting…" : "CSV"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run("xlsx")}
          className={`${buttonClass} bg-ink text-white hover:opacity-90`}
        >
          Excel
        </button>
      </div>
      {error ? (
        <p className="max-w-[16rem] text-right text-xs text-mute">{error}</p>
      ) : null}
    </div>
  );
}
