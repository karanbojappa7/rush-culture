import { BaseEntity } from '../../../../common/entities/base.entity';

export class CartEntity extends BaseEntity {
  sessionId!: string | null;
}

export class CartItemEntity extends BaseEntity {
  cartId!: string;
  variantId!: string;
  quantity!: number;
}
