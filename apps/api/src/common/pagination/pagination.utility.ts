export type PageQuery = {
  page: number;
  limit: number;
  skip: number;
};

export type PageResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export function parsePageQuery(
  page?: string | number,
  limit?: string | number,
  options?: { defaultLimit?: number; maxLimit?: number },
): PageQuery {
  const defaultLimit = options?.defaultLimit ?? DEFAULT_PAGE_LIMIT;
  const maxLimit = options?.maxLimit ?? MAX_PAGE_LIMIT;
  const parsedPage = Math.max(1, Math.floor(Number(page)) || 1);
  const parsedLimit = Math.min(
    maxLimit,
    Math.max(1, Math.floor(Number(limit)) || defaultLimit),
  );
  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };
}

export function toPageResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PageResult<T> {
  const safeTotal = Math.max(0, total);
  return {
    items,
    page,
    limit,
    total: safeTotal,
    totalPages: safeTotal === 0 ? 0 : Math.ceil(safeTotal / limit),
  };
}
