const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).max(100).required(),
  role: Joi.string().valid('ADMIN', 'STAFF').optional(),
});

const memberCreateSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(/^\+254[0-9]{9}$/).required(),
  email: Joi.string().email().required(),
  packageId: Joi.string().uuid().required(),
});

const memberUpdateSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).optional(),
  lastName: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^\+254[0-9]{9}$/).optional(),
  email: Joi.string().email().optional(),
  status: Joi.string().valid('ACTIVE', 'EXPIRED', 'SUSPENDED').optional(),
}).min(1);

const packageCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().positive().precision(2).required(),
  durationDays: Joi.number().integer().positive().required(),
  description: Joi.string().max(500).optional(),
});

const packageUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  price: Joi.number().positive().precision(2).optional(),
  durationDays: Joi.number().integer().positive().optional(),
  description: Joi.string().max(500).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

const renewalSchema = Joi.object({
  memberId: Joi.string().uuid().required(),
  packageId: Joi.string().uuid().required(),
  mpesaPhone: Joi.string().pattern(/^\+254[0-9]{9}$/).required(),
});

module.exports = {
  loginSchema,
  registerSchema,
  memberCreateSchema,
  memberUpdateSchema,
  packageCreateSchema,
  packageUpdateSchema,
  renewalSchema,
};
