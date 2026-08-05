export function utcNow(): Date {
  return new Date(Date.now());
}

export function toUtcDate(input: string | number | Date): Date {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) {
      throw new Error('Invalid date');
    }
    return new Date(input.getTime());
  }

  if (typeof input === 'number') {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Invalid date');
  }

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
  const date = new Date(dateOnly ? `${trimmed}T00:00:00.000Z` : trimmed);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${input}`);
  }
  return date;
}

export function toUtcIso(
  input: string | number | Date | null | undefined,
): string | null {
  if (input == null) return null;
  return toUtcDate(input).toISOString();
}

export function optionalUtcDate(
  input: string | number | Date | null | undefined,
): Date | null | undefined {
  if (input === undefined) return undefined;
  if (input === null) return null;
  return toUtcDate(input);
}

export function isWithinUtcWindow(
  at: Date,
  startsAt?: Date | null,
  endsAt?: Date | null,
): boolean {
  const instant = at.getTime();
  if (startsAt && instant < startsAt.getTime()) return false;
  if (endsAt && instant > endsAt.getTime()) return false;
  return true;
}
