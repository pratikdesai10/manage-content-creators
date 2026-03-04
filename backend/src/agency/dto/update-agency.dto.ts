import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AgencyProductCategory } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

class UpdateAgencyBase {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brandName?: string;

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

  @ApiPropertyOptional({ enum: AgencyProductCategory })
  @IsOptional()
  @IsEnum(AgencyProductCategory)
  productCategory?: AgencyProductCategory;
}

export class UpdateAgencyDto extends PartialType(UpdateAgencyBase) {}
