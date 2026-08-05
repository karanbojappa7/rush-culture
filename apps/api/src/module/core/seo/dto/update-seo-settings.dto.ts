import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsString,
  Max,
  Min,
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
  contactDescription!: string;

  @IsString()
  homeTitle!: string;

  @IsString()
  homeDescription!: string;

  @IsString()
  keywords!: string;

  @IsString()
  siteName!: string;

  @IsString()
  applicationName!: string;

  @IsBoolean()
  robotsIndex!: boolean;

  @IsBoolean()
  robotsFollow!: boolean;

  @IsBoolean()
  robotsNoArchive!: boolean;

  @IsBoolean()
  robotsNoSnippet!: boolean;

  @IsBoolean()
  robotsNoImageIndex!: boolean;

  @IsIn(['none', 'standard', 'large'])
  maxImagePreview!: 'none' | 'standard' | 'large';

  @Type(() => Number)
  @IsInt()
  @Min(-1)
  @Max(100000)
  maxSnippet!: number;

  @Type(() => Number)
  @IsInt()
  @Min(-1)
  @Max(100000)
  maxVideoPreview!: number;

  @IsString()
  canonicalBaseUrl!: string;

  @IsString()
  robotsSitemapUrl!: string;

  @IsString()
  locale!: string;

  @IsString()
  ogTitle!: string;

  @IsString()
  ogDescription!: string;

  @IsString()
  ogImageUrl!: string;

  @IsString()
  ogImageAlt!: string;

  @IsString()
  ogType!: string;

  @IsIn(['summary', 'summary_large_image'])
  twitterCard!: 'summary' | 'summary_large_image';

  @IsString()
  twitterHandle!: string;

  @IsString()
  twitterCreator!: string;

  @IsString()
  twitterTitle!: string;

  @IsString()
  twitterDescription!: string;

  @IsString()
  twitterImageUrl!: string;

  @IsBoolean()
  enableOrganizationSchema!: boolean;

  @IsIn(['Organization', 'OnlineStore', 'ClothingStore', 'Store'])
  organizationType!:
    | 'Organization'
    | 'OnlineStore'
    | 'ClothingStore'
    | 'Store';

  @IsString()
  organizationName!: string;

  @IsString()
  organizationLogoUrl!: string;

  @IsString()
  organizationEmail!: string;

  @IsString()
  organizationPhone!: string;

  @IsString()
  organizationUrl!: string;

  @IsArray()
  @IsString({ each: true })
  sameAs!: string[];

  @IsBoolean()
  enableWebsiteSchema!: boolean;

  @IsString()
  siteSearchUrlTemplate!: string;

  @IsBoolean()
  enableProductSchema!: boolean;

  @IsString()
  googleSiteVerification!: string;

  @IsString()
  bingSiteVerification!: string;

  @IsString()
  yandexSiteVerification!: string;

  @IsString()
  pinterestSiteVerification!: string;

  @IsString()
  facebookAppId!: string;

  @IsString()
  faviconUrl!: string;

  @IsString()
  appleTouchIconUrl!: string;

  @IsArray()
  @IsString({ each: true })
  noIndexPaths!: string[];

  @IsBoolean()
  sitemapIncludeStatic!: boolean;

  @IsBoolean()
  sitemapIncludeProducts!: boolean;

  @IsBoolean()
  sitemapIncludeCollections!: boolean;

  @IsArray()
  @IsString({ each: true })
  sitemapStaticPaths!: string[];

  @IsArray()
  @IsString({ each: true })
  sitemapAdditionalPaths!: string[];
}
