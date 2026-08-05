import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { CustomerQueryTopic } from '@prisma/client';

export class CreateCustomerQueryDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(CustomerQueryTopic)
  topic!: CustomerQueryTopic;

  @IsString()
  @MinLength(3)
  subject!: string;

  @IsString()
  @MinLength(10)
  message!: string;

  @IsOptional()
  @IsString()
  orderNumber?: string;
}
