import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreatorCategory } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

class UpdateCreatorBase {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayName?: string;

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

  @ApiPropertyOptional({ enum: CreatorCategory })
  @IsOptional()
  @IsEnum(CreatorCategory)
  category?: CreatorCategory;
}

export class UpdateCreatorDto extends PartialType(UpdateCreatorBase) {}
