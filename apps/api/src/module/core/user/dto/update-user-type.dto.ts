import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateUserTypeDto } from './create-user-type.dto';

export class UpdateUserTypeDto extends PartialType(CreateUserTypeDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
