import { Body, Controller, ForbiddenException, Get, Param, Patch, UseGuards } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard, AgencyGuard)
  @Get(':id/stats')
  async getStats(@Param('id') id: string, @CurrentUser() user: User) {
    const profile = await this.agencyService.findOne(id);
    if (profile.userId !== user.id) {
      throw new ForbiddenException('Access restricted to profile owner');
    }
    return this.agencyService.getDashboardStats(id);
  }

  @UseGuards(JwtAuthGuard, AgencyGuard)
  @Get(':id/campaigns')
  async getCampaigns(@Param('id') id: string, @CurrentUser() user: User) {
    const profile = await this.agencyService.findOne(id);
    if (profile.userId !== user.id) {
      throw new ForbiddenException('Access restricted to profile owner');
    }
    return this.agencyService.getRecentCampaigns(id);
  }

  @UseGuards(JwtAuthGuard, AgencyGuard)
  @Get(':id/messages')
  async getMessages(@Param('id') id: string, @CurrentUser() user: User) {
    const profile = await this.agencyService.findOne(id);
    if (profile.userId !== user.id) {
      throw new ForbiddenException('Access restricted to profile owner');
    }
    return this.agencyService.getRecentAgencyMessages(id);
  }

  @UseGuards(JwtAuthGuard, AgencyGuard)
  @Get(':id/campaigns/:campaignId')
  async getCampaignDetail(
    @Param('id') id: string,
    @Param('campaignId') campaignId: string,
    @CurrentUser() user: User,
  ) {
    const profile = await this.agencyService.findOne(id);
    if (profile.userId !== user.id) {
      throw new ForbiddenException('Access restricted to profile owner');
    }
    return this.agencyService.getCampaignDetail(id, campaignId);
  }

  @UseGuards(JwtAuthGuard, AgencyGuard)
  @Get(':id/messages/:messageId/thread')
  async getMessageThread(
    @Param('id') id: string,
    @Param('messageId') messageId: string,
    @CurrentUser() user: User,
  ) {
    const profile = await this.agencyService.findOne(id);
    if (profile.userId !== user.id) {
      throw new ForbiddenException('Access restricted to profile owner');
    }
    return this.agencyService.getAgencyMessageThread(id, messageId);
  }

  @UseGuards(JwtAuthGuard, AgencyGuard)
  @Get(':id/top-creators')
  async getTopCreators(@Param('id') id: string, @CurrentUser() user: User) {
    const profile = await this.agencyService.findOne(id);
    if (profile.userId !== user.id) {
      throw new ForbiddenException('Access restricted to profile owner');
    }
    return this.agencyService.getTopCreators(id);
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
