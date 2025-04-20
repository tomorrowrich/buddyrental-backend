import { Buddy, PrismaClient, User } from '@prisma/client';
import { userPassword } from '../src/prisma/prisma.extension';
import * as buddies from './data/buddies.json';
import * as buddyTags from './data/tags-buddies.json';
import * as userTags from './data/tags-users.json';
import * as tags from './data/tags.json';
import * as users from './data/users.json';

const prisma = new PrismaClient().$extends(userPassword);

let skippedUserSeeding = false;

async function main() {
  console.log('Start seeding...');

  await seedReportCategory();

  await seedUser();
  await seedVerifiedUser();

  await seedBuddy();

  // await seedTags(); Temporarily disabled due to Supabase issue

  await seedChat();

  await seedAdmin();

  console.log('Seeding finished successfully');
  console.log('Disconnecting...');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(() => {
    return prisma.$disconnect();
  });

async function seedAdmin() {
  console.time('seed-admin');
  console.log('Start seeding admin');
  // First check if user with admin role exists
  const existingUser = await prisma.user.findFirst({
    where: {
      email: 'admin@buddy.rental',
      admin: {
        firstName: 'Admin',
        lastName: 'Buddy',
      },
    },
    include: {
      admin: true,
    },
  });

  if (existingUser && existingUser.admin) {
    console.log('Admin already exists, skipping seeding');
  } else {
    await prisma.user.upsert({
      where: {
        email: 'admin@buddy.rental',
      },
      update: {
        admin: {
          create: {
            firstName: 'Admin',
            lastName: 'Buddy',
          },
        },
      },
      create: {
        email: 'admin@buddy.rental',
        address: 'REDACTED',
        citizenId: 'REDACTED',
        city: 'REDACTED',
        dateOfBirth: new Date(0, 0, 0),
        firstName: 'Admin',
        lastName: 'Buddy',
        gender: 'UNKNOWN',
        displayName: 'Admin Buddy',
        description: 'Admin of Buddy Rental',
        password: '1234',
        phoneNumber: 'REDACTED',
        postalCode: 'REDACTED',
        admin: {
          create: {
            firstName: 'Admin',
            lastName: 'Buddy',
          },
        },
        verified: true,
      },
    });
  }

  console.timeEnd('seed-admin');
  console.log('Seeding Admin finished successfully\n');
}

async function seedReportCategory() {
  console.time('seed-report-category');
  console.log('Start seeding ReportCategory...');

  const reportCategories = [
    // User problem related categories
    {
      id: '4430c74b-f39c-4190-8332-326e1edda5f7',
      name: 'Account Issues',
    },
    {
      id: '25d40017-05ad-498b-bfcf-88632cff85d9',
      name: 'Payment Problems',
    },
    {
      id: '4fcad569-38a9-43f9-b629-b3bce0ef526f',
      name: 'Rental Experience',
    },
    {
      id: '28b62f4e-82b1-4ad1-b337-ac00e792a214',
      name: 'Buddy Host Complaints',
    },
    {
      id: '85cd6225-8333-4b0d-9ea7-0b7d9c0454cf',
      name: 'Safety Concerns',
    },

    // App problems related categories
    {
      id: 'cebae3c6-4ba6-4747-b351-325eb000243c',
      name: 'App Crashes',
    },
    {
      id: 'b474cc8e-9a6d-402f-a56c-1659c149aa19',
      name: 'Feature Requests',
    },
    {
      id: '6a2439f1-33a5-4a62-82fc-6468ed2237b3',
      name: 'UI/UX Issues',
    },
    {
      id: '2a210419-bedc-4f61-86ca-53c6459e20b8',
      name: 'Search/Filter Problems',
    },
    {
      id: 'cc27c907-80d3-4813-8a71-fa4e3141768a',
      name: 'Notification Issues',
    },
    {
      id: 'e19abe05-3691-4e79-af60-a3d9e76c959d',
      name: 'Booking Process Errors',
    },
    {
      id: 'a902287f-d65a-439d-ac10-eb981c57412d',
      name: 'Verification Problems',
    },
    {
      id: '4bdc2786-38bf-4d48-8e38-f57658da5ec3',
      name: 'Feedback & Suggestions',
    },
    {
      id: '6fb1dfaf-d12e-4ce7-a392-f5d83d91a46e',
      name: 'Other',
    },
  ];

  for (const category of reportCategories) {
    await prisma.reportsCategory.upsert({
      where: {
        id: category.id,
      },
      update: {
        name: category.name,
      },
      create: {
        id: category.id,
        name: category.name,
      },
    });
  }

  console.timeEnd('seed-report-category');
  console.log('Seeding ReportCategory finished successfully\n');
}

async function seedUser() {
  console.time('seed-user');
  console.log('Start seeding User...');

  const existingUsers = await prisma.user.count();

  await prisma.user.upsert({
    where: {
      email: 'user@buddy.rental',
    },
    update: {},
    create: {
      email: 'user@buddy.rental',
      address: 'REDACTED',
      citizenId: '0',
      city: 'REDACTED',
      dateOfBirth: new Date(0, 0, 0),
      firstName: 'Customer',
      lastName: 'Doe',
      gender: 'UNKNOWN',
      displayName: 'johndoe',
      description: 'Test User',
      password: '1234',
      phoneNumber: '0',
      postalCode: 'REDACTED',
      verified: true,
    },
  });

  if (existingUsers > 0) {
    skippedUserSeeding = true;
    console.timeEnd('seed-user');
    console.log('User already exists, skipping seeding\n');
    return;
  }

  await prisma.user.createMany({
    data: { ...(users as any as User[]) },
    skipDuplicates: true,
  });

  console.timeEnd('seed-user');
  console.log('Seeding User finished successfully\n');
}

async function seedVerifiedUser() {
  console.time('seed-verified-user');
  console.log('Start seeding VerifiedUser...');

  const existingVerifiedUsers = await prisma.user.count({
    where: {
      verified: true,
    },
  });

  if (existingVerifiedUsers > 0) {
    console.timeEnd('seed-verified-user');
    console.log('VerifiedUser already exists, skipping seeding\n');
    return;
  }

  await prisma.user.updateMany({
    where: {
      verified: false,
    },
    data: {
      verified: true,
    },
    limit: Math.floor((await prisma.user.count()) * 0.8),
  });

  console.timeEnd('seed-verified-user');
  console.log('Seeding VerifiedUser finished successfully\n');
}

async function seedBuddy() {
  console.time('seed-buddy');
  console.log('Start seeding Buddy...');

  const existingBuddies = await prisma.buddy.count();

  await prisma.user.upsert({
    where: {
      email: 'buddy@buddy.rental',
    },
    update: {
      buddy: {
        create: {
          balanceWithdrawable: 0,
          description: 'Test Buddy',
          totalReviews: 0,
          priceMin: 0,
        },
      },
    },
    create: {
      email: 'buddy@buddy.rental',
      address: 'REDACTED',
      citizenId: '1',
      city: 'REDACTED',
      dateOfBirth: new Date(0, 0, 0),
      firstName: 'Buddy',
      lastName: 'Test',
      gender: 'UNKNOWN',
      displayName: 'buddytest',
      description: 'Test User',
      password: '1234',
      phoneNumber: '1',
      postalCode: 'REDACTED',
      verified: true,
      buddy: {
        create: {
          balanceWithdrawable: 0,
          description: 'Test Buddy',
          totalReviews: 0,
          priceMin: 0,
        },
      },
    },
  });

  if (skippedUserSeeding || existingBuddies > 0) {
    console.timeEnd('seed-buddy');
    console.log('Buddy already exists, skipping seeding\n');
    return;
  }

  await prisma.buddy.createMany({
    data: buddies as any as Buddy[],
    skipDuplicates: true,
  });

  console.timeEnd('seed-buddy');
  console.log('Seeding Buddy finished successfully\n');
}

async function seedChat() {
  const customer = await prisma.user.findUnique({
    where: {
      email: 'user@buddy.rental',
    },
  });

  const buddyUser = await prisma.user.findUnique({
    where: {
      email: 'buddy@buddy.rental',
    },
    include: {
      buddy: true,
    },
  });
  const buddy = buddyUser?.buddy;

  if (!customer || !buddy) {
    console.error('Test buddy or customer not found, skipping chat seeding');
    return;
  }
  console.time('seed-chat');
  console.log('Start seeding Chat...');

  const existingChats = await prisma.chat.count();

  if (existingChats > 0) {
    console.timeEnd('seed-chat');
    console.log('Chat already exists, skipping seeding\n');
    return;
  }

  await prisma.chat.upsert({
    where: {
      buddyId_customerId: {
        buddyId: buddy.buddyId,
        customerId: customer.userId,
      },
    },
    update: {},
    create: {
      buddy: {
        connect: {
          buddyId: buddy.buddyId,
        },
      },
      customer: {
        connect: {
          userId: customer.userId,
        },
      },
    },
  });

  console.timeEnd('seed-chat');
  console.log('Seeding Chat finished successfully\n');
}

async function seedTags() {
  console.time('seed-tags');
  console.log('Start seeding Tags...');

  const existingTags = await prisma.tag.count();

  if (existingTags > 0) {
    console.timeEnd('seed-tags');
    console.log('Tags already exist, skipping seeding\n');
    return;
  }

  await prisma.tag.createMany({
    data: tags,
    skipDuplicates: true,
  });

  await Promise.all(
    userTags.map((userTag) =>
      prisma.user.update({
        where: {
          userId: userTag.userId,
        },
        data: {
          interests: {
            connect: [{ tagId: userTag.tagId }],
          },
        },
      }),
    ),
  );

  await Promise.all(
    buddyTags.map((buddyTag) =>
      prisma.buddy.update({
        where: {
          buddyId: buddyTag.buddyId,
        },
        data: {
          tags: {
            connect: [{ tagId: buddyTag.tagId }],
          },
        },
      }),
    ),
  );

  console.timeEnd('seed-tags');
  console.log('Seeding Tags finished successfully\n');
}
