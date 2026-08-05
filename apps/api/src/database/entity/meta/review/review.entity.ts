import { BaseEntity } from '../../../../common/entities/base.entity';

export class ReviewEntity extends BaseEntity {
  productId!: string;
  customerId!: string;
  rating!: number;
  title!: string | null;
  body!: string | null;
  isApproved!: boolean;
}
