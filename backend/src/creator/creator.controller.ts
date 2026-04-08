import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
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
  @Get('locations')
  getLocations(@Query('field') field: 'city' | 'state', @Query('q') q: string) {
    return this.creatorService.getLocationSuggestions(field, q ?? '');
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creatorService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, CreatorGuard)
  @Get(':id/stats')
  async getStats(@Param('id') id: string, @CurrentUser() user: User) {
    const profile = await this.creatorService.findOne(id);
    if (profile.userId !== user.id) {
      throw new ForbiddenException('Access restricted to profile owner');
    }
    return this.creatorService.getDashboardStats(id);
  }

  @UseGuards(JwtAuthGuard, CreatorGuard)
  @Get(':id/collaborations')
  async getCollaborations(@Param('id') id: string, @CurrentUser() user: User) {
    const profile = await this.creatorService.findOne(id);
    if (profile.userId !== user.id) {
      throw new ForbiddenException('Access restricted to profile owner');
    }
    return this.creatorService.getRecentCollaborations(id);
  }

  @UseGuards(JwtAuthGuard, CreatorGuard)
  @Get(':id/messages')
  async getMessages(@Param('id') id: string, @CurrentUser() user: User) {
    const profile = await this.creatorService.findOne(id);
    if (profile.userId !== user.id) {
      throw new ForbiddenException('Access restricted to profile owner');
    }
    return this.creatorService.getRecentMessages(id);
  }

  @UseGuards(JwtAuthGuard, CreatorGuard)
  @Get(':id/collaborations/:collabId')
  async getCollaborationDetail(
    @Param('id') id: string,
    @Param('collabId') collabId: string,
    @CurrentUser() user: User,
  ) {
    const profile = await this.creatorService.findOne(id);
    if (profile.userId !== user.id) {
      throw new ForbiddenException('Access restricted to profile owner');
    }
    return this.creatorService.getCollaborationDetail(id, collabId);
  }

  @UseGuards(JwtAuthGuard, CreatorGuard)
  @Get(':id/messages/:messageId/thread')
  async getMessageThread(
    @Param('id') id: string,
    @Param('messageId') messageId: string,
    @CurrentUser() user: User,
  ) {
    const profile = await this.creatorService.findOne(id);
    if (profile.userId !== user.id) {
      throw new ForbiddenException('Access restricted to profile owner');
    }
    return this.creatorService.getMessageThread(id, messageId);
  }

  @UseGuards(JwtAuthGuard, CreatorGuard)
  @Get(':id/social-accounts/:accountId')
  async getSocialAccountDetail(
    @Param('id') id: string,
    @Param('accountId') accountId: string,
    @CurrentUser() user: User,
  ) {
    const profile = await this.creatorService.findOne(id);
    if (profile.userId !== user.id) {
      throw new ForbiddenException('Access restricted to profile owner');
    }
    return this.creatorService.getSocialAccountDetail(id, accountId);
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
