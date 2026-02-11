const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const config = require('../config/index.cjs');
const { loginSchema, registerSchema } = require('../validators/schemas.cjs');

const login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const payload = { userId: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });

  res.json({
    success: true,
    data: { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token, refreshToken },
  });
};

const register = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const { email, password, name, role } = req.body;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(400).json({ success: false, message: 'Email exists' });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashed, name, role: role || 'STAFF' },
  });

  res.status(201).json({
    success: true,
    data: { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
  });
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, message: 'Token required' });

  try {
    const payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) throw new Error('Invalid');

    const newPayload = { userId: user.id, email: user.email, role: user.role };
    const newToken = jwt.sign(newPayload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    const newRefresh = jwt.sign(newPayload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });

    res.json({ success: true, data: { token: newToken, refreshToken: newRefresh } });
  } catch (e) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
  });
  res.json({ success: true, data: user });
};

module.exports = { login, register, refreshToken, getProfile };
