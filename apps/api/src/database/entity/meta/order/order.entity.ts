import { OrderStatus, PaymentStatus } from '@prisma/client';
import { BaseEntity } from '../../../../common/entities/base.entity';

export class OrderEntity extends BaseEntity {
  orderNumber!: string;
  customerId!: string | null;
  status!: OrderStatus;
  paymentStatus!: PaymentStatus;
  subtotalInPaise!: number;
  discountInPaise!: number;
  shippingInPaise!: number;
  taxInPaise!: number;
  totalInPaise!: number;
  currency!: string;
  paymentMethod!: string | null;
  paymentDetails!: string | null;
  customerEmail!: string | null;
  shippingFullName!: string;
  shippingPhone!: string;
  shippingLine1!: string;
  shippingLine2!: string | null;
  shippingCity!: string;
  shippingState!: string;
  shippingPostalCode!: string;
  shippingCountry!: string;
}

export class OrderItemEntity extends BaseEntity {
  orderId!: string;
  variantId!: string | null;
  productSlug!: string | null;
  productName!: string;
  variantSku!: string;
  size!: string;
  color!: string;
  unitPriceInPaise!: number;
  quantity!: number;
  lineTotalInPaise!: number;
}
