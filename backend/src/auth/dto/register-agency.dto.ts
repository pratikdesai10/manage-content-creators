import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CompanySize,
  ContentType,
  CreatorCategory,
  IndustryCategory,
  SocialPlatform,
} from '@prisma/client';

export enum BudgetRange {
  BUDGET_5K_20K = 'BUDGET_5K_20K',
  BUDGET_20K_1L = 'BUDGET_20K_1L',
  BUDGET_1L_5L = 'BUDGET_1L_5L',
  BUDGET_5L_PLUS = 'BUDGET_5L_PLUS',
  VARIES = 'VARIES',
}

export enum PaymentType {
  FIXED = 'FIXED',
  AFFILIATE = 'AFFILIATE',
  PRODUCT_EXCHANGE = 'PRODUCT_EXCHANGE',
  HYBRID = 'HYBRID',
  PERFORMANCE_BASED = 'PERFORMANCE_BASED',
}

export enum PaymentTimeline {
  UPFRONT = 'UPFRONT',
  ON_DELIVERY = 'ON_DELIVERY',
  FIFTEEN_DAYS = 'FIFTEEN_DAYS',
  THIRTY_DAYS = 'THIRTY_DAYS',
  MILESTONE_BASED = 'MILESTONE_BASED',
}

export enum FollowerRange {
  NANO = 'NANO',
  MICRO = 'MICRO',
  MID_TIER = 'MID_TIER',
  MACRO = 'MACRO',
  MEGA = 'MEGA',
  ANY = 'ANY',
}
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class BrandSocialsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  youtube?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  twitter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  linkedin?: string;
}

export class TargetAudienceDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  ageGroups: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  genders: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  locations: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  languages: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  incomeBracket?: string;
}

export class CampaignPreferencesDto {
  @ApiProperty({ enum: SocialPlatform, isArray: true })
  @IsArray()
  @IsEnum(SocialPlatform, { each: true })
  platforms: SocialPlatform[];

  @ApiProperty({ enum: ContentType, isArray: true })
  @IsArray()
  @IsEnum(ContentType, { each: true })
  contentTypes: ContentType[];

  @ApiProperty({ enum: PaymentType, isArray: true })
  @IsArray()
  @IsEnum(PaymentType, { each: true })
  paymentTypes: PaymentType[];

  @ApiProperty({ enum: FollowerRange, isArray: true })
  @IsArray()
  @IsEnum(FollowerRange, { each: true })
  preferredFollowerRange: FollowerRange[];

  @ApiProperty({ enum: CreatorCategory, isArray: true })
  @IsArray()
  @IsEnum(CreatorCategory, { each: true })
  preferredCreatorCategories: CreatorCategory[];

  @ApiProperty({ enum: BudgetRange })
  @IsEnum(BudgetRange)
  budgetRange: BudgetRange;

  @ApiProperty({ enum: PaymentTimeline })
  @IsEnum(PaymentTimeline)
  paymentTimeline: PaymentTimeline;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  campaignsPerMonth?: number;
}

export class RegisterAgencyDto {
  @ApiProperty({ minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty()
  @IsEmail()
  workEmail: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ minLength: 2, maxLength: 50 })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  designation: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @ApiProperty({ minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  brandName: string;

  @ApiProperty({ minLength: 2, maxLength: 150 })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  companyLegalName: string;

  @ApiProperty()
  @IsUrl()
  website: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({ enum: IndustryCategory })
  @IsEnum(IndustryCategory)
  industry: IndustryCategory;

  @ApiProperty({ enum: CompanySize })
  @IsEnum(CompanySize)
  companySize: CompanySize;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearFounded?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiProperty({ minLength: 50, maxLength: 500 })
  @IsString()
  @MinLength(50)
  @MaxLength(500)
  description: string;

  @ApiPropertyOptional({ type: BrandSocialsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BrandSocialsDto)
  brandSocials?: BrandSocialsDto;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pinCode?: string;

  @ApiProperty({ type: TargetAudienceDto })
  @ValidateNested()
  @Type(() => TargetAudienceDto)
  targetAudience: TargetAudienceDto;

  @ApiProperty({ type: CampaignPreferencesDto })
  @ValidateNested()
  @Type(() => CampaignPreferencesDto)
  campaignPreferences: CampaignPreferencesDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;
}
