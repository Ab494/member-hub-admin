const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Get admin credentials from environment or use defaults for development
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@memberhub.dev';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';

// Warn about using default credentials in development
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  console.warn('⚠️  Using default admin credentials for development!');
  console.warn(`   Email: ${ADMIN_EMAIL}`);
  console.warn(`   Password: ${ADMIN_PASSWORD}`);
  console.warn('   Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables for production.');
}

async function main() {
  console.log('Seeding database...');

  // Create admin user if not exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        password: hashedPassword,
        name: ADMIN_NAME,
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log(`Admin user created: ${ADMIN_EMAIL} / [password from env]`);
  } else {
    console.log('Admin user already exists');
  }

  // Create sample packages if none exist
  const existingPackages = await prisma.package.findMany();
  if (existingPackages.length === 0) {
    await prisma.package.createMany({
      data: [
        {
          name: 'Daily',
          price: 100,
          durationDays: 1,
          description: 'Daily access pass',
          isActive: true,
        },
        {
          name: 'Weekly',
          price: 500,
          durationDays: 7,
          description: '7-day access pass',
          isActive: true,
        },
        {
          name: 'Monthly',
          price: 1500,
          durationDays: 30,
          description: '30-day monthly membership',
          isActive: true,
        },
        {
          name: 'Yearly',
          price: 12000,
          durationDays: 365,
          description: '1-year annual membership',
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
