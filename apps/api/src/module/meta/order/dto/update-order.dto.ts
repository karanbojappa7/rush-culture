import { OrderStatus, PaymentStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  razorpayOrderId?: string;

  @IsOptional()
  @IsString()
  razorpayPaymentId?: string;

  @IsOptional()
  @IsString()
  razorpaySignature?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  paymentDetails?: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  shippingFullName?: string;

  @IsOptional()
  @IsString()
  shippingPhone?: string;

  @IsOptional()
  @IsString()
  shippingLine1?: string;

  @IsOptional()
  @IsString()
  shippingLine2?: string;

  @IsOptional()
  @IsString()
  shippingCity?: string;

  @IsOptional()
  @IsString()
  shippingState?: string;

  @IsOptional()
  @IsString()
  shippingPostalCode?: string;

  @IsOptional()
  @IsString()
  shippingCountry?: string;
}
