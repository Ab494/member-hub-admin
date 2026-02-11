const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const { memberCreateSchema, memberUpdateSchema } = require('../validators/schemas.cjs');

const getAll = async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;
  const where = {};
  if (search) {
    where.OR = [
      { memberCode: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }
  if (status && status.toUpperCase() !== 'ALL') where.status = status;

  const [data, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: { package: { select: { id: true, name: true, price: true, durationDays: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    }),
    prisma.member.count({ where: where.status ? where : {} }),
  ]);

  res.json({
    success: true,
    data: { data, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
  });
};

const getById = async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { id: req.params.id },
    include: { package: true, payments: { orderBy: { createdAt: 'desc' }, take: 5 } },
  });
  if (!member) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: member });
};

const create = async (req, res) => {
  const { error } = memberCreateSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const { firstName, lastName, phone, email, packageId } = req.body;
  const exists = await prisma.member.findUnique({ where: { email } });
  if (exists) return res.status(400).json({ success: false, message: 'Email exists' });

  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg) return res.status(400).json({ success: false, message: 'Package not found' });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + pkg.durationDays);

  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const memberCode = `MEM${timestamp}${random}`;

  const member = await prisma.member.create({
    data: { memberCode, firstName, lastName, phone, email, packageId, expiresAt },
    include: { package: true },
  });

  res.status(201).json({ success: true, data: member });
};

const update = async (req, res) => {
  const { error } = memberUpdateSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const member = await prisma.member.update({
    where: { id: req.params.id },
    data: req.body,
    include: { package: true },
  });
  res.json({ success: true, data: member });
};

const remove = async (req, res) => {
  await prisma.member.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Deleted' });
};

const getBySearch = async (req, res) => {
  const { search } = req.params;
  let member;
  if (search.startsWith('MEM')) {
    member = await prisma.member.findUnique({ where: { memberCode: search }, include: { package: true } });
  } else if (search.includes('@')) {
    member = await prisma.member.findUnique({ where: { email: search }, include: { package: true } });
  } else {
    member = await prisma.member.findFirst({ where: { phone: search }, include: { package: true } });
  }
  if (!member) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({
    success: true,
    data: {
      memberCode: member.memberCode,
      name: `${member.firstName} ${member.lastName}`,
      status: member.status,
      package: member.package.name,
      enrolledAt: member.enrolledAt,
      expiresAt: member.expiresAt,
    },
  });
};

module.exports = { getAll, getById, create, update, remove, getBySearch };
