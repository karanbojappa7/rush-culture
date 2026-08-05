import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAppConfigDto {
  @IsString()
  @MinLength(1)
  key!: string;

  @IsString()
  value!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
