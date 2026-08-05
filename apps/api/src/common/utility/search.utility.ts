type ContainsFilter = { contains: string; mode: 'insensitive' };

export function normalizeSearchQuery(q?: string): string | undefined {
  const term = q?.trim();
  return term || undefined;
}

export function buildContainsOr<T extends string>(
  q: string | undefined,
  fields: readonly T[],
): { OR: Array<Record<T, ContainsFilter>> } | undefined {
  const term = normalizeSearchQuery(q);
  if (!term || fields.length === 0) return undefined;
  return {
    OR: fields.map(
      (field) =>
        ({
          [field]: { contains: term, mode: 'insensitive' },
        }) as Record<T, ContainsFilter>,
    ),
  };
}
