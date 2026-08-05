import {
  IsBoolean,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDiscountDto {
  @IsString()
  @MinLength(1)
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  percentOff?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  amountOffInPaise?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minOrderInPaise?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxUses?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  usedCount?: number;

  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @IsOptional()
  @IsISO8601()
  endsAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
