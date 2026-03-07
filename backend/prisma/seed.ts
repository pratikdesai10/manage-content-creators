import { PrismaClient, CollaborationType, CollaborationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const creators = await prisma.creatorProfile.findMany({ take: 3 });

  if (creators.length === 0) {
    console.warn('No creator profiles found. Register a creator first, then re-run seed.');
    process.exit(1);
  }

  // Clear ALL existing mock data before seeding
  await prisma.collaboration.deleteMany({});
  await prisma.message.deleteMany({});

  for (const creator of creators) {

    await prisma.collaboration.createMany({
      data: [
        {
          creatorId: creator.id,
          brandName: 'Zomato',
          brandLogo: null,
          type: CollaborationType.PAID_CAMPAIGNS,
          status: CollaborationStatus.COMPLETED,
          createdAt: new Date('2026-02-01'),
        },
        {
          creatorId: creator.id,
          brandName: 'Boat',
          brandLogo: null,
          type: CollaborationType.BRAND_AMBASSADOR,
          status: CollaborationStatus.ACTIVE,
          createdAt: new Date('2026-02-15'),
        },
        {
          creatorId: creator.id,
          brandName: 'Mamaearth',
          brandLogo: null,
          type: CollaborationType.PRODUCT_EXCHANGE,
          status: CollaborationStatus.COMPLETED,
          createdAt: new Date('2026-01-20'),
        },
      ],
    });

    await prisma.message.createMany({
      data: [
        {
          creatorId: creator.id,
          brandName: 'Nike India',
          preview: 'Hi! We loved your recent reel and would love to discuss a campaign...',
          isRead: false,
          createdAt: new Date('2026-03-06'),
        },
        {
          creatorId: creator.id,
          brandName: 'Nykaa',
          preview: "We're launching a new skincare line and think you'd be a great fit...",
          isRead: true,
          createdAt: new Date('2026-03-04'),
        },
        {
          creatorId: creator.id,
          brandName: 'Lenskart',
          preview: 'Partnership opportunity for our upcoming summer collection...',
          isRead: false,
          createdAt: new Date('2026-03-01'),
        },
      ],
    });

    console.log(`Seeded data for creator: ${creator.displayName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
