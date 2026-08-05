export type PageResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function emptyPage<T>(limit = 20): PageResult<T> {
  return { items: [], page: 1, limit, total: 0, totalPages: 0 };
}
