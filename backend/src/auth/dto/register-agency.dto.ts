import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AgencyProductCategory } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class RegisterAgencyDto {
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
  brandName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyRegistration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AgencyProductCategory })
  @IsEnum(AgencyProductCategory)
  productCategory: AgencyProductCategory;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  contactPersonName: string;

  @ApiProperty()
  @IsEmail()
  contactEmail: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  designation?: string;
}
