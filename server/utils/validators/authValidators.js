const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().email('Please provide a valid email'),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s-]{7,15}$/, 'Please provide a valid phone number')
    .optional()
    .or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s-]{7,15}$/)
    .optional()
    .or(z.literal('')),
  city: z.string().trim().max(80).optional(),
  area: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(500).optional(),
  profileImage: z
    .object({
      url: z.string(),
      publicId: z.string().optional(),
    })
    .optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
};