export type OrderLine = {
  unitPriceInPaise: number;
  quantity: number;
};

export function computeLineTotal(item: OrderLine): number {
  return item.unitPriceInPaise * item.quantity;
}

export function computeShipping(subtotalInPaise: number): number {
  return subtotalInPaise >= 199900 ? 0 : 9900;
}

export function computeOrderTotals(items: OrderLine[]) {
  const subtotalInPaise = items.reduce(
    (total, item) => total + computeLineTotal(item),
    0,
  );
  const shippingInPaise = computeShipping(subtotalInPaise);
  return {
    subtotalInPaise,
    shippingInPaise,
    totalInPaise: subtotalInPaise + shippingInPaise,
  };
}
