import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateSeoSettingsDto {
  @IsString()
  titleDefault!: string;

  @IsString()
  titleTemplate!: string;

  @IsString()
  description!: string;

  @IsString()
  shortDescription!: string;

  @IsString()
  shopDescription!: string;

  @IsString()
  keywords!: string;

  @IsBoolean()
  robotsIndex!: boolean;

  @IsBoolean()
  robotsFollow!: boolean;

  @IsString()
  canonicalBaseUrl!: string;

  @IsString()
  locale!: string;

  @IsString()
  ogTitle!: string;

  @IsString()
  ogDescription!: string;

  @IsString()
  ogImageUrl!: string;

  @IsString()
  ogType!: string;

  @IsIn(['summary', 'summary_large_image'])
  twitterCard!: 'summary' | 'summary_large_image';

  @IsString()
  twitterHandle!: string;

  @IsString()
  twitterTitle!: string;

  @IsString()
  twitterDescription!: string;

  @IsString()
  twitterImageUrl!: string;

  @IsString()
  organizationName!: string;

  @IsString()
  organizationLogoUrl!: string;

  @IsString()
  organizationEmail!: string;

  @IsArray()
  @IsString({ each: true })
  sameAs!: string[];

  @IsString()
  googleSiteVerification!: string;

  @IsString()
  bingSiteVerification!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  noIndexPaths!: string[];
}
