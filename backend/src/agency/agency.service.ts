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

// ── Mock data for agency dashboard ─────────────────────────────────────────

const MOCK_CAMPAIGNS = [
  {
    id: 'camp-1',
    creatorName: 'Priya Sharma',
    creatorAvatar: null,
    type: 'PAID_CAMPAIGNS',
    status: 'ACTIVE',
    brief: 'Create a series of Instagram Reels showcasing our new summer collection. Focus on styling tips for young professionals aged 22-30.',
    deliverables: ['3 Instagram Reels', '5 Story frames', '1 Feed post with carousel'],
    timeline: 'Mar 15 – Apr 10, 2026',
    budget: '₹75,000',
    contactPerson: 'Rahul Mehta',
    contactEmail: 'rahul@collabhub.in',
    createdAt: '2026-03-10T10:30:00Z',
  },
  {
    id: 'camp-2',
    creatorName: 'Arjun Kapoor',
    creatorAvatar: null,
    type: 'PRODUCT_EXCHANGE',
    status: 'PENDING',
    brief: 'Unboxing and review video of our flagship wireless earbuds. Highlight noise cancellation and battery life features.',
    deliverables: ['1 YouTube video (8-12 min)', '2 Instagram Stories'],
    timeline: 'Mar 20 – Apr 5, 2026',
    budget: 'Product exchange + ₹15,000',
    contactPerson: 'Sneha Patel',
    contactEmail: 'sneha@collabhub.in',
    createdAt: '2026-03-08T14:15:00Z',
  },
  {
    id: 'camp-3',
    creatorName: 'Meera Joshi',
    creatorAvatar: null,
    type: 'BRAND_AMBASSADOR',
    status: 'COMPLETED',
    brief: 'Quarter-long brand ambassador program for our organic skincare line. Monthly content creation and event appearances.',
    deliverables: ['4 Instagram posts/month', '2 YouTube videos', '1 event appearance'],
    timeline: 'Dec 1, 2025 – Feb 28, 2026',
    budget: '₹2,50,000',
    contactPerson: 'Rahul Mehta',
    contactEmail: 'rahul@collabhub.in',
    createdAt: '2025-12-01T09:00:00Z',
  },
];

const MOCK_MESSAGES = [
  {
    id: 'amsg-1',
    creatorName: 'Priya Sharma',
    preview: 'Hi! I\'ve finalized the content calendar for next week. Can we schedule a quick call?',
    isRead: false,
    createdAt: '2026-03-13T16:45:00Z',
  },
  {
    id: 'amsg-2',
    creatorName: 'Arjun Kapoor',
    preview: 'Thanks for sending the product. I\'ll start filming the review tomorrow.',
    isRead: true,
    createdAt: '2026-03-12T11:20:00Z',
  },
  {
    id: 'amsg-3',
    creatorName: 'Meera Joshi',
    preview: 'The final deliverables have been uploaded to the shared drive. Please review!',
    isRead: false,
    createdAt: '2026-03-11T09:30:00Z',
  },
];

const MOCK_MESSAGE_THREADS: Record<string, { sender: 'BRAND' | 'CREATOR'; text: string; sentAt: string }[]> = {
  'amsg-1': [
    { sender: 'CREATOR', text: 'Hi! I\'ve been working on the content plan for the summer collection campaign.', sentAt: '2026-03-13T14:00:00Z' },
    { sender: 'BRAND', text: 'Great to hear! Can you share a draft of the content calendar?', sentAt: '2026-03-13T14:30:00Z' },
    { sender: 'CREATOR', text: 'Sure! I\'ve finalized the content calendar for next week. Can we schedule a quick call?', sentAt: '2026-03-13T16:45:00Z' },
  ],
  'amsg-2': [
    { sender: 'BRAND', text: 'Hi Arjun, the earbuds have been shipped. You should receive them by Friday.', sentAt: '2026-03-11T10:00:00Z' },
    { sender: 'CREATOR', text: 'Awesome! Looking forward to testing them out.', sentAt: '2026-03-11T12:15:00Z' },
    { sender: 'CREATOR', text: 'Thanks for sending the product. I\'ll start filming the review tomorrow.', sentAt: '2026-03-12T11:20:00Z' },
  ],
  'amsg-3': [
    { sender: 'BRAND', text: 'Hi Meera, hope the final month of the program went well!', sentAt: '2026-03-10T09:00:00Z' },
    { sender: 'CREATOR', text: 'It was wonderful! The audience response has been incredible.', sentAt: '2026-03-10T11:30:00Z' },
    { sender: 'BRAND', text: 'Could you upload the remaining deliverables to the shared drive?', sentAt: '2026-03-10T15:00:00Z' },
    { sender: 'CREATOR', text: 'The final deliverables have been uploaded to the shared drive. Please review!', sentAt: '2026-03-11T09:30:00Z' },
  ],
};

const MOCK_TOP_CREATORS = [
  { id: 'tc-1', name: 'Priya Sharma', platform: 'INSTAGRAM', followers: 284000, engagementRate: 4.8, avatarUrl: null },
  { id: 'tc-2', name: 'Arjun Kapoor', platform: 'YOUTUBE', followers: 1250000, engagementRate: 3.2, avatarUrl: null },
  { id: 'tc-3', name: 'Meera Joshi', platform: 'INSTAGRAM', followers: 156000, engagementRate: 5.6, avatarUrl: null },
];

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

  // Dashboard methods: controller already calls findOne() for ownership verification,
  // so these methods skip the redundant lookup. TODO: Replace mock data with real Prisma queries.

  async getDashboardStats(_agencyId: string) {
    return {
      activeCampaigns: 8,
      creatorsContacted: 42,
      totalSpend: 1250000,
      messageCount: 15,
      unreadMessages: 4,
      budgetBreakdown: [
        { type: 'PAID_CAMPAIGNS', amount: 520000 },
        { type: 'BRAND_AMBASSADOR', amount: 350000 },
        { type: 'PRODUCT_EXCHANGE', amount: 180000 },
        { type: 'AFFILIATE', amount: 120000 },
        { type: 'EVENT_APPEARANCES', amount: 50000 },
        { type: 'HYBRID', amount: 30000 },
      ],
    };
  }

  async getRecentCampaigns(_agencyId: string) {
    return MOCK_CAMPAIGNS;
  }

  async getRecentAgencyMessages(_agencyId: string) {
    return MOCK_MESSAGES;
  }

  async getCampaignDetail(_agencyId: string, campaignId: string) {
    const campaign = MOCK_CAMPAIGNS.find((c) => c.id === campaignId);
    if (!campaign) {
      throw new NotFoundException(`Campaign ${campaignId} not found`);
    }
    return campaign;
  }

  async getAgencyMessageThread(_agencyId: string, messageId: string) {
    const message = MOCK_MESSAGES.find((m) => m.id === messageId);
    if (!message) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }
    const threads = (MOCK_MESSAGE_THREADS[messageId] ?? []).map((t, i) => ({
      id: `${messageId}-t${i}`,
      ...t,
    }));
    return { ...message, threads };
  }

  async getTopCreators(_agencyId: string) {
    return MOCK_TOP_CREATORS;
  }
}
