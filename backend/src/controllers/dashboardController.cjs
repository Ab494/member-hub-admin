const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getStats = async (req, res) => {
  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [totalMembers, activeMembers, expiredMembers, expiringMembers, totalRevenue, monthlyRevenue, recentRenewals] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { status: 'ACTIVE' } }),
    prisma.member.count({ where: { status: 'EXPIRED' } }),
    prisma.member.count({ where: { status: 'ACTIVE', expiresAt: { lte: sevenDays, gte: now } } }),
    prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: 'COMPLETED', paidAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } }, _sum: { amount: true } }),
    prisma.renewal.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { member: { select: { id: true, firstName: true, lastName: true } }, package: { select: { id: true, name: true } } } }),
  ]);

  res.json({
    success: true,
    data: {
      totalMembers,
      activeMembers,
      expiredMembers,
      expiringMembers,
      totalRevenue: Number(totalRevenue._sum.amount) || 0,
      monthlyRevenue: Number(monthlyRevenue._sum.amount) || 0,
      recentRenewals: recentRenewals.map(r => ({
        id: r.id,
        member: { id: r.member.id, name: `${r.member.firstName} ${r.member.lastName}` },
        package: { id: r.package.id, name: r.package.name },
        amount: Number(r.amount),
        date: r.createdAt,
      })),
    },
  });
};

module.exports = { getStats };
