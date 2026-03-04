import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreatorGuard } from '../auth/guards/creator.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateCreatorDto } from './dto/update-creator.dto';
import { CreatorService } from './creator.service';

@ApiTags('creators')
@Controller('creators')
export class CreatorController {
  constructor(private readonly creatorService: CreatorService) {}

  @Public()
  @Get()
  findAll() {
    return this.creatorService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creatorService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, CreatorGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateCreatorDto,
  ) {
    return this.creatorService.update(id, user.id, dto);
  }
}
