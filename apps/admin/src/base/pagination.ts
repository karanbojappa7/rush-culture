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

export function pageQuery(params: {
  page?: number | string;
  limit?: number | string;
  [key: string]: string | number | undefined;
}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === "all") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
