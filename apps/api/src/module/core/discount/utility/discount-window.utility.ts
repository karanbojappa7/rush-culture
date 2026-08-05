import { BadRequestException } from '@nestjs/common';
import { Discount } from '@prisma/client';
import {
  isWithinUtcWindow,
  optionalUtcDate,
  utcNow,
} from '../../../../common/utility/date.utility';

export function parseDiscountDates(
  startsAt?: string | null,
  endsAt?: string | null,
): { startsAt?: Date | null; endsAt?: Date | null } {
  return {
    startsAt: optionalUtcDate(startsAt),
    endsAt: optionalUtcDate(endsAt),
  };
}

export function assertDiscountWindowValid(
  startsAt?: Date | null,
  endsAt?: Date | null,
): void {
  if (startsAt && endsAt && endsAt.getTime() < startsAt.getTime()) {
    throw new BadRequestException(
      'Discount end date must not precede start date',
    );
  }
}

export function isDiscountActiveNow(
  discount: Discount,
  at: Date = utcNow(),
): boolean {
  return (
    discount.isActive &&
    !discount.isDeleted &&
    isWithinUtcWindow(at, discount.startsAt, discount.endsAt)
  );
}
