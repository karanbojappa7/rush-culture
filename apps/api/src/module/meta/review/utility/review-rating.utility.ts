import { BadRequestException } from '@nestjs/common';

export function assertValidRating(rating: number): void {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new BadRequestException('Rating must be an integer between 1 and 5');
  }
}
