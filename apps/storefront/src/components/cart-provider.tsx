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
};

type CartContextValue = {
  items: CartLine[];
  count: number;
  subtotalInPaise: number;
  addItem: (item: Omit<CartLine, "key" | "quantity">, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
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
      setItems((prev) => {
        const existing = prev.find((line) => line.key === key);
        if (existing) {
          return prev.map((line) =>
            line.key === key
              ? { ...line, quantity: line.quantity + quantity }
              : line,
          );
        }
        return [...prev, { ...item, key, quantity }];
      });
    },
    [],
  );

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((line) => (line.key === key ? { ...line, quantity } : line))
        .filter((line) => line.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((line) => line.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

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
      addItem,
      updateQuantity,
      removeItem,
      clear,
    };
  }, [items, addItem, updateQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
