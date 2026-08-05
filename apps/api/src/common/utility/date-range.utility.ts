import { toUtcDate } from './date.utility';

export type DateRangeQuery = {
  from?: string;
  to?: string;
};

export type CreatedAtRange = {
  gte?: Date;
  lt?: Date;
};

export function parseDateRangeQuery(
  from?: string,
  to?: string,
): CreatedAtRange | undefined {
  const gte = parseDayStart(from);
  const lt = parseDayEndExclusive(to);
  if (!gte && !lt) return undefined;
  return {
    ...(gte ? { gte } : {}),
    ...(lt ? { lt } : {}),
  };
}

export function buildCreatedAtFilter(
  from?: string,
  to?: string,
): { createdAt: CreatedAtRange } | undefined {
  const range = parseDateRangeQuery(from, to);
  if (!range) return undefined;
  return { createdAt: range };
}

function parseDayStart(value?: string): Date | undefined {
  const day = normalizeDay(value);
  if (!day) return undefined;
  return toUtcDate(day);
}

function parseDayEndExclusive(value?: string): Date | undefined {
  const day = normalizeDay(value);
  if (!day) return undefined;
  const start = toUtcDate(day);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

function normalizeDay(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    try {
      return toUtcDate(trimmed).toISOString().slice(0, 10);
    } catch {
      return undefined;
    }
  }
  return trimmed;
}
