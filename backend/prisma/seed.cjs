const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user if not exists
  const adminEmail = 'admin@memberhub.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log('Admin user created: admin@memberhub.com / admin123');
  } else {
    console.log('Admin user already exists');
  }

  // Create sample packages if none exist
  const existingPackages = await prisma.package.findMany();
  if (existingPackages.length === 0) {
    await prisma.package.createMany({
      data: [
        {
          name: 'Basic',
          price: 500,
          durationDays: 30,
          description: 'Basic membership - 30 days access',
          isActive: true,
        },
        {
          name: 'Standard',
          price: 1200,
          durationDays: 90,
          description: 'Standard membership - 90 days access',
          isActive: true,
        },
        {
          name: 'Premium',
          price: 4000,
          durationDays: 365,
          description: 'Premium membership - 1 year access',
          isActive: true,
        },
      ],
    });
    console.log('Sample packages created');
  } else {
    console.log('Packages already exist');
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
