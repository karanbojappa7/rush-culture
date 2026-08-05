import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsObject,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const COLOR_PATTERN =
  /^(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})|rgba?\([^)]+\)|hsla?\([^)]+\))$/;

const FONT_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ]{0,48}[A-Za-z0-9]$|^[A-Za-z0-9]{2,50}$/;

export class ThemeColorsDto {
  @IsString()
  @Matches(COLOR_PATTERN)
  ink!: string;

  @IsString()
  @Matches(COLOR_PATTERN)
  paper!: string;

  @IsString()
  @Matches(COLOR_PATTERN)
  mist!: string;

  @IsString()
  @Matches(COLOR_PATTERN)
  mute!: string;

  @IsString()
  @Matches(COLOR_PATTERN)
  accent!: string;

  @IsString()
  @Matches(COLOR_PATTERN)
  accentInk!: string;

  @IsString()
  @Matches(COLOR_PATTERN)
  panel!: string;

  @IsString()
  @Matches(COLOR_PATTERN)
  line!: string;
}

export class UpdateThemeSettingsDto {
  @IsString()
  themeId!: string;

  @IsIn(['day', 'night'])
  colorMode!: 'day' | 'night';

  @IsIn(['sm', 'md', 'lg', 'custom'])
  fontScale!: 'sm' | 'md' | 'lg' | 'custom';

  @IsInt()
  @Min(12)
  @Max(24)
  fontSizePx!: number;

  @IsString()
  @Matches(FONT_NAME_PATTERN)
  displayFont!: string;

  @IsString()
  @Matches(FONT_NAME_PATTERN)
  bodyFont!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ThemeColorsDto)
  colors!: ThemeColorsDto;
}
