"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { brand } from "@linq/site-config";

export type CartLine = {
  key: string;
  productId: string;
  productSlug: string;
  productName: string;
  image: string;
  variantId: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  unitPriceInPaise: number;
  quantity: number;
  maxStock?: number;
};

export type StockSyncSummary = {
  removed: string[];
  adjusted: string[];
};

type CartContextValue = {
  items: CartLine[];
  count: number;
  subtotalInPaise: number;
  ready: boolean;
  addItem: (item: Omit<CartLine, "key" | "quantity">, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  applyStock: (
    stocks: Array<{ variantId: string; stock: number }>,
  ) => StockSyncSummary;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = brand.cartStorageKey;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartLine[]);
    } catch {
      setItems([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback(
    (item: Omit<CartLine, "key" | "quantity">, quantity = 1) => {
      const key = `${item.variantId}`;
      const max =
        typeof item.maxStock === "number" && item.maxStock >= 0
          ? item.maxStock
          : Number.POSITIVE_INFINITY;
      setItems((prev) => {
        const existing = prev.find((line) => line.key === key);
        if (existing) {
          const nextQty = Math.min(existing.quantity + quantity, max);
          if (nextQty === existing.quantity) return prev;
          return prev.map((line) =>
            line.key === key
              ? {
                  ...line,
                  quantity: nextQty,
                  maxStock: item.maxStock ?? line.maxStock,
                }
              : line,
          );
        }
        const nextQty = Math.min(quantity, max);
        if (nextQty <= 0) return prev;
        return [
          ...prev,
          { ...item, key, quantity: nextQty, maxStock: item.maxStock },
        ];
      });
    },
    [],
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((line) => {
          if (line.key !== key) return line;
          const max =
            typeof line.maxStock === "number" && line.maxStock >= 0
              ? line.maxStock
              : Number.POSITIVE_INFINITY;
          return { ...line, quantity: Math.min(quantity, max) };
        })
        .filter((line) => line.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((line) => line.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const applyStock = useCallback(
    (stocks: Array<{ variantId: string; stock: number }>) => {
      const byId = new Map(stocks.map((row) => [row.variantId, row.stock]));
      const removed: string[] = [];
      const adjusted: string[] = [];

      setItems((prev) =>
        prev
          .map((line) => {
            if (!byId.has(line.variantId)) return line;
            const stock = byId.get(line.variantId) ?? 0;
            if (stock <= 0) {
              removed.push(line.productName);
              return null;
            }
            if (line.quantity > stock) {
              adjusted.push(line.productName);
              return { ...line, maxStock: stock, quantity: stock };
            }
            return { ...line, maxStock: stock };
          })
          .filter((line): line is CartLine => line !== null),
      );

      return { removed, adjusted };
    },
    [],
  );

  const value = useMemo<CartContextValue>(() => {
    const subtotalInPaise = items.reduce(
      (sum, line) => sum + line.unitPriceInPaise * line.quantity,
      0,
    );
    const count = items.reduce((sum, line) => sum + line.quantity, 0);
    return {
      items,
      count,
      subtotalInPaise,
      ready,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      applyStock,
    };
  }, [
    items,
    ready,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    applyStock,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
