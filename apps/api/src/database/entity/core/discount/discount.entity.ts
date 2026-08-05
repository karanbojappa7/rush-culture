import { BaseEntity } from '../../../../common/entities/base.entity';

export class DiscountEntity extends BaseEntity {
  code!: string;
  description!: string | null;
  percentOff!: number | null;
  amountOffInPaise!: number | null;
  minOrderInPaise!: number | null;
  maxUses!: number | null;
  usedCount!: number;
  startsAt!: Date | null;
  endsAt!: Date | null;
  isActive!: boolean;
}
