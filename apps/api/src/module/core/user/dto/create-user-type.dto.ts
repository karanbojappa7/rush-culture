import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserTypeDto {
  @IsString()
  @MinLength(2)
  @Matches(/^[A-Z0-9_]+$/i)
  code!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
