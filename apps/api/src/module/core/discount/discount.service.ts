import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Discount } from '@prisma/client';
import { BaseService } from '../../../common/base/base.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { DiscountRepo } from './discount.repo';
import {
  assertDiscountWindowValid,
  parseDiscountDates,
} from './utility/discount-window.utility';

@Injectable()
export class DiscountService extends BaseService {
  constructor(private readonly discountRepo: DiscountRepo) {
    super(DiscountService.name);
  }

  async create(payload: CreateDiscountDto): Promise<Discount> {
    const code = payload.code.trim().toUpperCase();
    const existing = await this.discountRepo.findByCode(code);
    if (existing) {
      throw new ConflictException(`Discount ${code} already exists`);
    }

    const { startsAt, endsAt } = parseDiscountDates(
      payload.startsAt,
      payload.endsAt,
    );
    assertDiscountWindowValid(startsAt, endsAt);

    return this.discountRepo.create({
      code,
      description: payload.description,
      percentOff: payload.percentOff,
      amountOffInPaise: payload.amountOffInPaise,
      minOrderInPaise: payload.minOrderInPaise,
      maxUses: payload.maxUses,
      usedCount: payload.usedCount,
      startsAt,
      endsAt,
      isActive: payload.isActive,
    });
  }

  async findById(payload: { id: string }): Promise<Discount> {
    const discount = await this.discountRepo.findById(payload.id);
    if (!discount) {
      throw new NotFoundException(`Discount ${payload.id} not found`);
    }
    return discount;
  }

  async findByCode(code: string): Promise<Discount> {
    const normalizedCode = code.trim().toUpperCase();
    const discount = await this.discountRepo.findByCode(normalizedCode);
    if (!discount) {
      throw new NotFoundException(`Discount ${normalizedCode} not found`);
    }
    return discount;
  }

  async findAll(): Promise<Discount[]> {
    return this.discountRepo.findAll({
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(payload: {
    id: string;
    data: UpdateDiscountDto;
  }): Promise<Discount> {
    const discount = await this.findById({ id: payload.id });
    const code = payload.data.code?.trim().toUpperCase();

    if (code && code !== discount.code) {
      const existing = await this.discountRepo.findByCode(code);
      if (existing) {
        throw new ConflictException(`Discount ${code} already exists`);
      }
    }

    const { startsAt, endsAt } = parseDiscountDates(
      payload.data.startsAt,
      payload.data.endsAt,
    );
    const nextStartsAt = startsAt === undefined ? discount.startsAt : startsAt;
    const nextEndsAt = endsAt === undefined ? discount.endsAt : endsAt;
    assertDiscountWindowValid(nextStartsAt, nextEndsAt);

    return this.discountRepo.update(payload.id, {
      ...payload.data,
      code,
      startsAt,
      endsAt,
    });
  }

  async softDelete(payload: { id: string }): Promise<Discount> {
    await this.findById(payload);
    return this.discountRepo.softDelete(payload.id);
  }
}
