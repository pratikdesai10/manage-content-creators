import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAgencyDto } from './dto/update-agency.dto';

const USER_SAFE_SELECT = {
  id: true,
  email: true,
  role: true,
  isVerified: true,
  createdAt: true,
};

@Injectable()
export class AgencyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.agencyProfile.findMany({
      include: {
        contact: true,
        user: { select: USER_SAFE_SELECT },
      },
    });
  }

  async findOne(id: string) {
    const agency = await this.prisma.agencyProfile.findUnique({
      where: { id },
      include: {
        contact: true,
        user: { select: USER_SAFE_SELECT },
      },
    });
    if (!agency) {
      throw new NotFoundException(`Agency profile ${id} not found`);
    }
    return agency;
  }

  async update(id: string, requestingUserId: string, dto: UpdateAgencyDto) {
    const agency = await this.prisma.agencyProfile.findUnique({
      where: { id },
    });
    if (!agency) {
      throw new NotFoundException(`Agency profile ${id} not found`);
    }
    if (agency.userId !== requestingUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.prisma.agencyProfile.update({
      where: { id },
      data: dto,
      include: {
        contact: true,
        user: { select: USER_SAFE_SELECT },
      },
    });
  }
}
