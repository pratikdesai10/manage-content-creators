import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Availability,
  CollaborationType,
  ContentType,
  CreatorCategory,
  RateRange,
  SocialPlatform,
  TravelScope,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
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
  @Min(0)
  followerCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountType?: string;
}

export class RegisterCreatorDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ minLength: 2, maxLength: 50 })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ minLength: 2, maxLength: 50 })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ minLength: 3, maxLength: 30 })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  displayName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsDateString()
  dateOfBirth: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;

  @ApiProperty({ minLength: 50, maxLength: 500 })
  @IsString()
  @MinLength(50)
  @MaxLength(500)
  bio: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  languages: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({ enum: CreatorCategory, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsEnum(CreatorCategory, { each: true })
  categories: CreatorCategory[];

  @ApiProperty({ enum: ContentType, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(ContentType, { each: true })
  contentTypes: ContentType[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;

  @ApiProperty({ enum: RateRange })
  @IsEnum(RateRange)
  rateRange: RateRange;

  @ApiProperty({ enum: CollaborationType, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(CollaborationType, { each: true })
  collaborationTypes: CollaborationType[];

  @ApiProperty({ enum: Availability })
  @IsEnum(Availability)
  availability: Availability;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  willingToTravel?: boolean;

  @ApiPropertyOptional({ enum: TravelScope })
  @IsOptional()
  @IsEnum(TravelScope)
  travelScope?: TravelScope;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  previousCollaborations?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notableBrands?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  whatsappNotifications?: boolean;

  @ApiProperty({ type: [SocialAccountDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SocialAccountDto)
  socialAccounts: SocialAccountDto[];
}
