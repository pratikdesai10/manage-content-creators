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
}
