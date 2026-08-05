import { IsOptional, IsString } from 'class-validator';

export class CreateCartDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
