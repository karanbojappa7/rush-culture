import { IsString } from 'class-validator';

export class UpdateBrandSettingsDto {
  @IsString()
  name!: string;

  @IsString()
  legalName!: string;

  @IsString()
  tagline!: string;

  @IsString()
  description!: string;

  @IsString()
  shortDescription!: string;

  @IsString()
  footerBlurb!: string;

  @IsString()
  locale!: string;

  @IsString()
  currency!: string;

  @IsString()
  country!: string;

  @IsString()
  supportEmail!: string;

  @IsString()
  supportPhone!: string;
}
