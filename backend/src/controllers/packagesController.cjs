const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const { packageCreateSchema, packageUpdateSchema } = require('../validators/schemas.cjs');

const getAll = async (req, res) => {
  const packages = await prisma.package.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: packages });
};

const getById = async (req, res) => {
  const pkg = await prisma.package.findUnique({ where: { id: req.params.id } });
  if (!pkg) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: pkg });
};

const create = async (req, res) => {
  const { error } = packageCreateSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const pkg = await prisma.package.create({ data: req.body });
  res.status(201).json({ success: true, data: pkg });
};

const update = async (req, res) => {
  const { error } = packageUpdateSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const pkg = await prisma.package.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: pkg });
};

const remove = async (req, res) => {
  await prisma.package.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Deleted' });
};

const toggleActive = async (req, res) => {
  const pkg = await prisma.package.findUnique({ where: { id: req.params.id } });
  if (!pkg) return res.status(404).json({ success: false, message: 'Not found' });
  const updated = await prisma.package.update({ where: { id: req.params.id }, data: { isActive: !pkg.isActive } });
  res.json({ success: true, data: updated });
};

module.exports = { getAll, getById, create, update, remove, toggleActive };
