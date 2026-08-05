import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';

export class RolePermissionGrantDto {
  @IsString()
  roleId!: string;

  @IsArray()
  @IsString({ each: true })
  permissionCodes!: string[];
}

export class SetPermissionMatrixDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RolePermissionGrantDto)
  grants!: RolePermissionGrantDto[];
}
