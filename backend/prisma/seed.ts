import { PrismaClient, CollaborationType, CollaborationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const creators = await prisma.creatorProfile.findMany({
    take: 3,
    include: { socialAccounts: true },
  });

  if (creators.length === 0) {
    console.warn('No creator profiles found. Register a creator first, then re-run seed.');
    process.exit(1);
  }

  // Clear ALL existing mock data
  await prisma.messageThread.deleteMany({});
  await prisma.collaboration.deleteMany({});
  await prisma.message.deleteMany({});

  for (const creator of creators) {
    // ── Collaborations with detail fields ────────────────────────────
    const collabs = await Promise.all([
      prisma.collaboration.create({
        data: {
          creatorId: creator.id,
          brandName: 'Zomato',
          brandLogo: null,
          type: CollaborationType.PAID_CAMPAIGNS,
          status: CollaborationStatus.COMPLETED,
          createdAt: new Date('2026-02-01'),
          brief: "Promote Zomato's new 10-minute delivery feature through 3 Instagram Reels highlighting speed and convenience in daily life.",
          deliverables: ['3 Instagram Reels', '5 Stories', '1 YouTube Short'],
          timeline: '15 Feb – 28 Feb 2026',
          budget: '₹45,000',
          contactPerson: 'Riya Sharma',
          contactEmail: 'riya.sharma@zomato.com',
        },
      }),
      prisma.collaboration.create({
        data: {
          creatorId: creator.id,
          brandName: 'Boat',
          brandLogo: null,
          type: CollaborationType.BRAND_AMBASSADOR,
          status: CollaborationStatus.ACTIVE,
          createdAt: new Date('2026-02-15'),
          brief: "Long-term brand ambassador for boAt's Airdopes 141 TWS earbuds. Monthly content featuring the product in lifestyle and fitness scenarios.",
          deliverables: ['2 Reels/month', '8 Stories/month', '1 unboxing video'],
          timeline: 'Feb 2026 – Jul 2026',
          budget: '₹1,20,000 total',
          contactPerson: 'Arjun Mehta',
          contactEmail: 'arjun@boat-lifestyle.com',
        },
      }),
      prisma.collaboration.create({
        data: {
          creatorId: creator.id,
          brandName: 'Mamaearth',
          brandLogo: null,
          type: CollaborationType.PRODUCT_EXCHANGE,
          status: CollaborationStatus.COMPLETED,
          createdAt: new Date('2026-01-20'),
          brief: "Review and unboxing of Mamaearth's new Vitamin C face wash range. Honest review format preferred.",
          deliverables: ['1 YouTube review (8+ min)', '3 Instagram Stories'],
          timeline: '25 Jan – 5 Feb 2026',
          budget: 'Products worth ₹3,500',
          contactPerson: 'Priya Nair',
          contactEmail: 'influencer@mamaearth.in',
        },
      }),
    ]);

    // ── Messages with thread data ────────────────────────────────────
    const nikeMsg = await prisma.message.create({
      data: {
        creatorId: creator.id,
        brandName: 'Nike India',
        preview: 'Hi! We loved your recent reel and would love to discuss a campaign...',
        isRead: false,
        createdAt: new Date('2026-03-06'),
      },
    });

    const nykaaMsg = await prisma.message.create({
      data: {
        creatorId: creator.id,
        brandName: 'Nykaa',
        preview: "We're launching a new skincare line and think you'd be a great fit...",
        isRead: true,
        createdAt: new Date('2026-03-04'),
      },
    });

    const lenskartMsg = await prisma.message.create({
      data: {
        creatorId: creator.id,
        brandName: 'Lenskart',
        preview: 'Partnership opportunity for our upcoming summer collection...',
        isRead: false,
        createdAt: new Date('2026-03-01'),
      },
    });

    // ── Message threads ──────────────────────────────────────────────
    await prisma.messageThread.createMany({
      data: [
        { messageId: nikeMsg.id, sender: 'BRAND', text: 'Hi! We loved your recent reel on fitness routines and would love to discuss a potential campaign for our new Air Max line.', sentAt: new Date('2026-03-06T09:00:00') },
        { messageId: nikeMsg.id, sender: 'CREATOR', text: 'Hey! Thanks so much, really appreciate it. Would love to hear more about the campaign. What kind of content are you looking for?', sentAt: new Date('2026-03-06T09:45:00') },
        { messageId: nikeMsg.id, sender: 'BRAND', text: "We're thinking 2 Reels and 5 Stories over a 2-week window. Budget is around ₹60K. Would that work for you?", sentAt: new Date('2026-03-06T10:15:00') },
        { messageId: nikeMsg.id, sender: 'CREATOR', text: 'That sounds great! Let me check my calendar and get back to you by EOD.', sentAt: new Date('2026-03-06T11:00:00') },

        { messageId: nykaaMsg.id, sender: 'BRAND', text: "We're launching a new Vitamin C skincare line next month and think you'd be a perfect fit. Interested in a collaboration?", sentAt: new Date('2026-03-04T11:00:00') },
        { messageId: nykaaMsg.id, sender: 'CREATOR', text: 'Hi Nykaa team! Yes, definitely interested. Could you share more details about the deliverables?', sentAt: new Date('2026-03-04T12:30:00') },
        { messageId: nykaaMsg.id, sender: 'BRAND', text: "We'd need 1 YouTube review (10+ min), 3 Instagram Reels, and a blog post. Full product kit will be sent to you.", sentAt: new Date('2026-03-04T14:00:00') },

        { messageId: lenskartMsg.id, sender: 'BRAND', text: 'Hello! We have an exciting partnership opportunity for our upcoming summer sunglasses collection. Would love to explore this with you.', sentAt: new Date('2026-03-01T10:00:00') },
        { messageId: lenskartMsg.id, sender: 'CREATOR', text: "Hi Lenskart! That sounds fun. I love eyewear content. What's the timeline looking like?", sentAt: new Date('2026-03-01T15:00:00') },
      ],
    });

    // ── Social account analytics ─────────────────────────────────────
    for (const account of creator.socialAccounts) {
      const mockData: Record<string, { engagementRate: number; avgLikes: number; growthPercent: number; topContentType: string }> = {
        INSTAGRAM: { engagementRate: 4.8, avgLikes: 2340, growthPercent: 12.5, topContentType: 'Reels' },
        YOUTUBE: { engagementRate: 6.2, avgLikes: 890, growthPercent: 8.3, topContentType: 'Long-form video' },
        TWITTER: { engagementRate: 2.1, avgLikes: 340, growthPercent: 3.7, topContentType: 'Threads' },
        FACEBOOK: { engagementRate: 1.8, avgLikes: 210, growthPercent: -1.2, topContentType: 'Static posts' },
        TIKTOK: { engagementRate: 9.4, avgLikes: 5600, growthPercent: 22.1, topContentType: 'Short video' },
        LINKEDIN: { engagementRate: 3.5, avgLikes: 180, growthPercent: 5.8, topContentType: 'Articles' },
        BLOG: { engagementRate: 1.2, avgLikes: 45, growthPercent: 2.0, topContentType: 'Long-form posts' },
      };

      const data = mockData[account.platform] ?? { engagementRate: 2.0, avgLikes: 100, growthPercent: 1.0, topContentType: 'Mixed' };

      await prisma.socialAccount.update({
        where: { id: account.id },
        data,
      });
    }

    console.log(`Seeded data for creator: ${creator.displayName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
