import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { AgencyGuard } from '../auth/guards/agency.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { AgencyService } from './agency.service';

@ApiTags('agencies')
@Controller('agencies')
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) {}

  @Public()
  @Get()
  findAll() {
    return this.agencyService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agencyService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, AgencyGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateAgencyDto,
  ) {
    return this.agencyService.update(id, user.id, dto);
  }
}
