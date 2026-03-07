import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCreatorDto } from './dto/update-creator.dto';

const USER_SAFE_SELECT = {
  id: true,
  email: true,
  role: true,
  isVerified: true,
  createdAt: true,
};

@Injectable()
export class CreatorService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.creatorProfile.findMany({
      include: {
        socialAccounts: true,
        user: { select: USER_SAFE_SELECT },
      },
    });
  }

  async findOne(id: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { id },
      include: {
        socialAccounts: true,
        user: { select: USER_SAFE_SELECT },
      },
    });
    if (!creator) {
      throw new NotFoundException(`Creator profile ${id} not found`);
    }
    return creator;
  }

  async update(id: string, requestingUserId: string, dto: UpdateCreatorDto) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { id },
    });
    if (!creator) {
      throw new NotFoundException(`Creator profile ${id} not found`);
    }
    if (creator.userId !== requestingUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.prisma.creatorProfile.update({
      where: { id },
      data: dto,
      include: {
        socialAccounts: true,
        user: { select: USER_SAFE_SELECT },
      },
    });
  }

  async getDashboardStats(creatorId: string) {
    await this.findOne(creatorId); // throws NotFoundException if not found
    const [collaborationCount, messageCount] = await Promise.all([
      this.prisma.collaboration.count({ where: { creatorId } }),
      this.prisma.message.count({ where: { creatorId } }),
    ]);

    return {
      profileViews: 1284, // mock static value — no tracking model yet
      collaborationCount,
      messageCount,
    };
  }

  async getRecentCollaborations(creatorId: string) {
    await this.findOne(creatorId); // throws NotFoundException if not found
    return this.prisma.collaboration.findMany({
      where: { creatorId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
  }

  async getRecentMessages(creatorId: string) {
    await this.findOne(creatorId); // throws NotFoundException if not found
    return this.prisma.message.findMany({
      where: { creatorId },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
  }

  async getCollaborationDetail(creatorId: string, collaborationId: string) {
    await this.findOne(creatorId);
    const collab = await this.prisma.collaboration.findUnique({
      where: { id: collaborationId },
    });
    if (!collab || collab.creatorId !== creatorId) {
      throw new NotFoundException(`Collaboration ${collaborationId} not found`);
    }
    return collab;
  }

  async getMessageThread(creatorId: string, messageId: string) {
    await this.findOne(creatorId);
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        threads: { orderBy: { sentAt: 'asc' } },
      },
    });
    if (!message || message.creatorId !== creatorId) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }
    return message;
  }

  async getSocialAccountDetail(creatorId: string, accountId: string) {
    await this.findOne(creatorId);
    const account = await this.prisma.socialAccount.findUnique({
      where: { id: accountId },
    });
    if (!account || account.creatorProfileId !== creatorId) {
      throw new NotFoundException(`Social account ${accountId} not found`);
    }
    return account;
  }
}
