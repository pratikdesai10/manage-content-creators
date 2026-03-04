import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterAgencyDto } from './dto/register-agency.dto';
import { RegisterCreatorDto } from './dto/register-creator.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerCreator(dto: RegisterCreatorDto) {
    await this.assertEmailUnique(dto.email);

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          phone: dto.phone,
          role: 'CREATOR',
          creatorProfile: {
            create: {
              displayName: dto.displayName,
              age: dto.age,
              bio: dto.bio,
              profileImageUrl: dto.profileImageUrl,
              category: dto.category,
              socialAccounts: {
                create: dto.socialAccounts.map((sa) => ({
                  platform: sa.platform,
                  handle: sa.handle,
                  profileUrl: sa.profileUrl,
                  followerCount: sa.followerCount ?? 0,
                })),
              },
            },
          },
        },
      });
      return newUser;
    });

    return this.generateTokensAndPersist(user);
  }

  async registerAgency(dto: RegisterAgencyDto) {
    await this.assertEmailUnique(dto.email);

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          phone: dto.phone,
          role: 'AGENCY',
          agencyProfile: {
            create: {
              brandName: dto.brandName,
              companyRegistration: dto.companyRegistration,
              logoUrl: dto.logoUrl,
              website: dto.website,
              description: dto.description,
              productCategory: dto.productCategory,
              contact: {
                create: {
                  contactPersonName: dto.contactPersonName,
                  contactEmail: dto.contactEmail,
                  contactPhone: dto.contactPhone,
                  designation: dto.designation,
                },
              },
            },
          },
        },
      });
      return newUser;
    });

    return this.generateTokensAndPersist(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const isValid =
      user !== null && (await bcrypt.compare(dto.password, user.passwordHash));

    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokensAndPersist(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return { ...tokens, user: safeUser };
  }

  async refreshTokens(rawToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: rawToken },
      include: { user: true },
    });

    if (!stored || stored.revokedAt !== null || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokensAndPersist(stored.user);
  }

  async logout(rawToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: rawToken },
    });

    if (stored && stored.revokedAt === null) {
      await this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  private async generateTokensAndPersist(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const rawRefreshToken = crypto.randomUUID();
    const refreshExpiresIn = this.configService.get<string>(
      'jwt.refreshTokenExpiresIn',
      '7d',
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.parseDays(refreshExpiresIn));

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: rawRefreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }

  private async assertEmailUnique(email: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }
  }

  private parseDays(duration: string): number {
    const match = duration.match(/^(\d+)d$/);
    if (match) return parseInt(match[1], 10);
    // fallback: 7 days
    return 7;
  }
}
