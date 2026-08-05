import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CustomerQueryStatus } from '@prisma/client';

export class UpdateCustomerQueryDto {
  @IsOptional()
  @IsEnum(CustomerQueryStatus)
  status?: CustomerQueryStatus;

  @IsOptional()
  @IsString()
  adminNote?: string;
}
