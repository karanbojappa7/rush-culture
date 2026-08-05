import { apiPost } from "@/base/api";

export type StockCheckItem = {
  variantId: string;
  sku: string | null;
  productName: string | null;
  productSlug: string | null;
  size: string | null;
  color: string | null;
  stock: number;
  requested: number;
  available: number;
  status: "ok" | "adjusted" | "sold_out" | "unavailable";
};

export type StockCheckResult = {
  ok: boolean;
  items: StockCheckItem[];
};

export async function checkCartStock(
  lines: Array<{ variantId: string; quantity: number }>,
): Promise<StockCheckResult | null> {
  if (!lines.length) return { ok: true, items: [] };
  const res = await apiPost<StockCheckResult>("/api/products/stock-check", {
    items: lines.map((line) => ({
      variantId: line.variantId,
      quantity: line.quantity,
    })),
  });
  if (res.status_code !== 200 || !res.data) return null;
  return res.data;
}

export function stockIssueMessage(result: StockCheckResult) {
  const sold = result.items.filter(
    (item) => item.status === "sold_out" || item.status === "unavailable",
  );
  const adjusted = result.items.filter((item) => item.status === "adjusted");
  const parts: string[] = [];
  if (sold.length) {
    parts.push(
      sold
        .map(
          (item) =>
            `${item.productName ?? "Item"} (${item.size}/${item.color}) is out of stock`,
        )
        .join(". "),
    );
  }
  if (adjusted.length) {
    parts.push(
      adjusted
        .map(
          (item) =>
            `${item.productName ?? "Item"} only has ${item.stock} left — bag updated`,
        )
        .join(". "),
    );
  }
  return parts.join(". ") || "Stock changed. Review your bag.";
}
