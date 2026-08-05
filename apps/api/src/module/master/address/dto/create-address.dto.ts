import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  userId!: string;

  @IsString()
  fullName!: string;

  @IsString()
  phone!: string;

  @IsString()
  line1!: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  postalCode!: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
