import { Type } from 'class-transformer';
import {
  IsIn,
  IsObject,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

const COLOR_PATTERN =
  /^(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})|rgba?\([^)]+\)|hsla?\([^)]+\))$/;

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

  @IsIn(['sm', 'md', 'lg'])
  fontScale!: 'sm' | 'md' | 'lg';

  @IsObject()
  @ValidateNested()
  @Type(() => ThemeColorsDto)
  colors!: ThemeColorsDto;
}
