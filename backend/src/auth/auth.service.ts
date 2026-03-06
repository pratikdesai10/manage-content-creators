import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterAgencyDto } from './dto/register-agency.dto';
import { RegisterCreatorDto } from './dto/register-creator.dto';

@Injectable()
export class AuthService {
  private readonly DUMMY_HASH =
    '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerCreator(dto: RegisterCreatorDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }

      const existingUsername = await tx.creatorProfile.findUnique({
        where: { displayName: dto.displayName },
      });
      if (existingUsername) {
        throw new ConflictException('Display name already taken');
      }

      return tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          phone: dto.phone,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: 'CREATOR',
          creatorProfile: {
            create: {
              firstName: dto.firstName,
              lastName: dto.lastName,
              displayName: dto.displayName,
              dateOfBirth: new Date(dto.dateOfBirth),
              gender: dto.gender,
              profileImageUrl: dto.profileImageUrl,
              bio: dto.bio,
              languages: dto.languages,
              city: dto.city,
              state: dto.state,
              country: dto.country,
              categories: dto.categories,
              contentTypes: dto.contentTypes,
              portfolioUrl: dto.portfolioUrl,
              rateRange: dto.rateRange,
              collaborationTypes: dto.collaborationTypes,
              availability: dto.availability,
              willingToTravel: dto.willingToTravel ?? false,
              travelScope: dto.travelScope,
              previousCollaborations: dto.previousCollaborations,
              notableBrands: dto.notableBrands ?? [],
              marketingEmails: dto.marketingEmails ?? true,
              whatsappNotifications: dto.whatsappNotifications ?? false,
              socialAccounts: {
                create: dto.socialAccounts.map((sa) => ({
                  platform: sa.platform,
                  handle: sa.handle,
                  profileUrl: sa.profileUrl,
                  followerCount: sa.followerCount ?? 0,
                  accountType: sa.accountType,
                })),
              },
            },
          },
        },
      });
    });

    return this.generateTokensAndPersist(user);
  }

  async registerAgency(dto: RegisterAgencyDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const nameParts = dto.fullName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const user = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { email: dto.workEmail },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }

      return tx.user.create({
        data: {
          email: dto.workEmail,
          passwordHash,
          phone: dto.phone,
          firstName,
          lastName,
          role: 'AGENCY',
          agencyProfile: {
            create: {
              brandName: dto.brandName,
              companyLegalName: dto.companyLegalName,
              industry: dto.industry,
              companySize: dto.companySize,
              yearFounded: dto.yearFounded,
              gstin: dto.gstin,
              logoUrl: dto.logoUrl,
              website: dto.website,
              description: dto.description,
              brandSocials: dto.brandSocials
                ? (dto.brandSocials as any)
                : undefined,
              city: dto.city,
              state: dto.state,
              country: dto.country,
              pinCode: dto.pinCode,
              targetAudience: dto.targetAudience as any,
              campaignPreferences: dto.campaignPreferences as any,
              marketingEmails: dto.marketingEmails ?? true,
              contact: {
                create: {
                  contactPersonName: dto.fullName,
                  contactEmail: dto.workEmail,
                  contactPhone: dto.phone,
                  designation: dto.designation,
                  linkedinUrl: dto.linkedinUrl,
                },
              },
            },
          },
        },
      });
    });

    return this.generateTokensAndPersist(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const isValid = await bcrypt.compare(
      dto.password,
      user?.passwordHash ?? this.DUMMY_HASH,
    );

    if (!user || !isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokensAndPersist(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return { ...tokens, user: safeUser };
  }

  async refreshTokens(rawToken: string) {
    return this.prisma.$transaction(async (tx) => {
      const stored = await tx.refreshToken.findUnique({
        where: { token: rawToken },
        include: { user: true },
      });

      if (
        !stored ||
        stored.revokedAt !== null ||
        stored.expiresAt < new Date()
      ) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      await tx.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      });

      return this.generateTokensAndPersistWithTx(tx, stored.user);
    });
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

  async checkUsernameAvailability(
    username: string,
  ): Promise<{ available: boolean }> {
    const existing = await this.prisma.creatorProfile.findUnique({
      where: { displayName: username },
    });
    return { available: !existing };
  }

  async checkEmailAvailability(
    email: string,
  ): Promise<{ available: boolean }> {
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });
    return { available: !existing };
  }

  private async generateTokensAndPersist(user: User) {
    return this.generateTokensAndPersistWithTx(this.prisma, user);
  }

  private async generateTokensAndPersistWithTx(
    tx: Prisma.TransactionClient | PrismaService,
    user: User,
  ) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const rawRefreshToken = crypto.randomUUID();
    const refreshExpiresIn = this.configService.get<string>(
      'jwt.refreshTokenExpiresIn',
      '7d',
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.parseDays(refreshExpiresIn));

    await tx.refreshToken.create({
      data: {
        userId: user.id,
        token: rawRefreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }

  private parseDays(duration: string): number {
    const match = duration.match(/^(\d+)d$/);
    if (match) return parseInt(match[1], 10);
    return 7;
  }
}
