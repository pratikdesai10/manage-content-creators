import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatorCategory, SocialPlatform } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class SocialAccountDto {
  @ApiProperty({ enum: SocialPlatform })
  @IsEnum(SocialPlatform)
  platform: SocialPlatform;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  handle: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  profileUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  followerCount?: number;
}

export class RegisterCreatorDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  displayName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  age?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;

  @ApiProperty({ enum: CreatorCategory })
  @IsEnum(CreatorCategory)
  category: CreatorCategory;

  @ApiProperty({ type: [SocialAccountDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SocialAccountDto)
  socialAccounts: SocialAccountDto[];
}
