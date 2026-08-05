import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsString,
  ValidateNested,
} from 'class-validator';

const CONTACT_TOPICS = [
  'SHIPPING',
  'RETURNS',
  'ORDER',
  'PRODUCT',
  'OTHER',
] as const;

export class PolicySectionDto {
  @IsString()
  title!: string;

  @IsString()
  body!: string;
}

export class PolicyDocumentDto {
  @IsString()
  title!: string;

  @IsString()
  intro!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PolicySectionDto)
  sections!: PolicySectionDto[];
}

export class SizeGuideRowDto {
  @IsString()
  size!: string;

  @IsString()
  chest!: string;

  @IsString()
  length!: string;

  @IsString()
  shoulder!: string;
}

export class SizeGuideSettingsDto {
  @IsString()
  title!: string;

  @IsString()
  intro!: string;

  @IsString()
  note!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizeGuideRowDto)
  rows!: SizeGuideRowDto[];
}

export class ContactTopicDto {
  @IsIn(CONTACT_TOPICS)
  value!: (typeof CONTACT_TOPICS)[number];

  @IsString()
  label!: string;
}

export class UpdatePoliciesSettingsDto {
  @ValidateNested()
  @Type(() => PolicyDocumentDto)
  shipping!: PolicyDocumentDto;

  @ValidateNested()
  @Type(() => PolicyDocumentDto)
  returns!: PolicyDocumentDto;

  @ValidateNested()
  @Type(() => SizeGuideSettingsDto)
  sizeGuide!: SizeGuideSettingsDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactTopicDto)
  contactTopics!: ContactTopicDto[];

  @IsString()
  contactIntro!: string;
}
