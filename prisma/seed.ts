import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

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
        password:
          '$argon2id$v=19$m=16,t=2,p=1$cjZrVnBtWHhRUERmZGREaw$LZiIERDdNVshOZ/lTeREKA',
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
  console.log('Seeding Admin finished successfully');

  console.log('Start seeding ReportCategory...');

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

  console.log('Seeding ReportCategory finished successfully');

  console.log('Seeding finished successfully');
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
