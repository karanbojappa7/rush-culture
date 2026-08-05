export function buildCartItemKey(cartId: string, variantId: string): string {
  return `${cartId}:${variantId}`;
}

export function mergeQuantity(existing: number, add: number): number {
  return existing + add;
}
