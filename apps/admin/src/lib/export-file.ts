export type SpreadsheetFormat = "csv" | "xlsx";

function escapeCsv(value: unknown): string {
  if (value == null) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function escapeXml(value: unknown): string {
  if (value == null) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function resolveColumns(
  rows: Array<Record<string, unknown>>,
  columns?: string[],
): string[] {
  if (columns?.length) return columns;
  const keys = new Set<string>();
  for (const row of rows) {
    Object.keys(row).forEach((key) => keys.add(key));
  }
  return Array.from(keys);
}

function toCsv(
  rows: Array<Record<string, unknown>>,
  columns: string[],
): string {
  const header = columns.map(escapeCsv).join(",");
  const body = rows
    .map((row) => columns.map((col) => escapeCsv(row[col])).join(","))
    .join("\r\n");
  return `\uFEFF${header}\r\n${body}`;
}

function toSpreadsheetXml(
  rows: Array<Record<string, unknown>>,
  columns: string[],
): string {
  const headerCells = columns
    .map((col) => `<Cell><Data ss:Type="String">${escapeXml(col)}</Data></Cell>`)
    .join("");
  const bodyRows = rows
    .map((row) => {
      const cells = columns
        .map((col) => {
          const value = row[col];
          const isNumber =
            typeof value === "number" && Number.isFinite(value);
          return `<Cell><Data ss:Type="${isNumber ? "Number" : "String"}">${escapeXml(value)}</Data></Cell>`;
        })
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Export">
  <Table>
   <Row>${headerCells}</Row>
   ${bodyRows}
  </Table>
 </Worksheet>
</Workbook>`;
}

function triggerDownload(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function downloadSpreadsheet(
  fileBaseName: string,
  rows: Array<Record<string, unknown>>,
  format: SpreadsheetFormat,
  columns?: string[],
) {
  const cols = resolveColumns(rows, columns);
  const stamp = new Date().toISOString().slice(0, 10);
  if (format === "csv") {
    triggerDownload(
      `${fileBaseName}-${stamp}.csv`,
      "text/csv;charset=utf-8",
      toCsv(rows, cols),
    );
    return;
  }
  triggerDownload(
    `${fileBaseName}-${stamp}.xls`,
    "application/vnd.ms-excel",
    toSpreadsheetXml(rows, cols),
  );
}
