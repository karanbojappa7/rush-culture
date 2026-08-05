import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  variantId!: string;

  @IsOptional()
  @IsString()
  productSlug?: string;

  @IsString()
  productName!: string;

  @IsString()
  variantSku!: string;

  @IsString()
  size!: string;

  @IsString()
  color!: string;

  @IsInt()
  @Min(0)
  unitPriceInPaise!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsEmail()
  customerEmail!: string;

  @IsString()
  shippingFullName!: string;

  @IsString()
  shippingPhone!: string;

  @IsString()
  shippingLine1!: string;

  @IsOptional()
  @IsString()
  shippingLine2?: string;

  @IsString()
  shippingCity!: string;

  @IsString()
  shippingState!: string;

  @IsString()
  shippingPostalCode!: string;

  @IsOptional()
  @IsString()
  shippingCountry?: string;

  @IsString()
  paymentMethod!: string;

  @IsOptional()
  @IsString()
  paymentDetails?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
