const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const { renewalSchema } = require('../validators/schemas.cjs');

const create = async (req, res) => {
  const { error } = renewalSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const { memberId, packageId } = req.body;
  const [member, pkg] = await Promise.all([
    prisma.member.findUnique({ where: { id: memberId } }),
    prisma.package.findUnique({ where: { id: packageId } }),
  ]);
  if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
  if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });

  const payment = await prisma.payment.create({
    data: { amount: pkg.price, mpesaPhone: req.body.mpesaPhone, status: 'PENDING', memberId, packageId },
  });

  res.json({ success: true, data: { paymentId: payment.id, amount: pkg.price, package: pkg.name, member: `${member.firstName} ${member.lastName}` } });
};

const getAll = async (req, res) => {
  const renewals = await prisma.renewal.findMany({
    include: { member: { select: { id: true, memberCode: true, firstName: true, lastName: true } }, package: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ success: true, data: renewals });
};

module.exports = { create, getAll };
