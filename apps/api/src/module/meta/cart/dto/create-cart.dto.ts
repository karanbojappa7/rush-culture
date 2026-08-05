import { IsOptional, IsString } from 'class-validator';

export class CreateCartDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
