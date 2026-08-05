import type { ReactNode } from "react";

export type DataTableColumn = {
  key: string;
  header: string;
  className?: string;
  align?: "left" | "right";
};

type Props = {
  columns: DataTableColumn[];
  empty: string;
  children: ReactNode;
  isEmpty?: boolean;
};

export function DataTable({ columns, empty, children, isEmpty }: Props) {
  return (
    <div className="overflow-x-auto border border-line bg-panel shadow-[0_1px_0_rgba(20,20,20,0.03)]">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-line bg-bg/60 text-[11px] tracking-[0.12em] uppercase text-mute">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 font-medium ${
                  column.align === "right" ? "text-right" : ""
                } ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr]:transition-colors [&_tr:hover]:bg-bg/70">
          {isEmpty ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-mute"
              >
                {empty}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function DataTableRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr className={`border-b border-line last:border-0 ${className}`}>
      {children}
    </tr>
  );
}

export function DataTableCell({
  children,
  className = "",
  mute = false,
  align = "left",
}: {
  children: ReactNode;
  className?: string;
  mute?: boolean;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`px-4 py-3 ${mute ? "text-mute" : ""} ${
        align === "right" ? "text-right" : ""
      } ${className}`}
    >
      {children}
    </td>
  );
}
