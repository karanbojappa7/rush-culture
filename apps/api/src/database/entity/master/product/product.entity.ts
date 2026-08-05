import { BaseEntity } from '../../../../common/entities/base.entity';

export class ProductEntity extends BaseEntity {
  name!: string;
  slug!: string;
  description!: string | null;
  brand!: string | null;
  isActive!: boolean;
  categoryId!: string | null;
}

export class ProductVariantEntity extends BaseEntity {
  productId!: string;
  sku!: string;
  size!: string;
  color!: string;
  colorHex!: string | null;
  priceInPaise!: number;
  compareAtPriceInPaise!: number | null;
  stock!: number;
  isActive!: boolean;
}

export class ProductImageEntity extends BaseEntity {
  productId!: string;
  url!: string;
  alt!: string | null;
  sortOrder!: number;
  isPrimary!: boolean;
}
