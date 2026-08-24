import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const logoutSchema = z.object({
  body: z.object({}).optional(),
});

export const tenantRegisterSchema = z.object({
  headers: z.object({
    'project-id': z.string().min(1, 'Project ID is required'),
    'api-key': z.string().min(1, 'API Key is required'),
  }).passthrough(),
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be at most 30 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const tenantLoginSchema = z.object({
  headers: z.object({
    'project-id': z.string().min(1, 'Project ID is required'),
    'api-key': z.string().min(1, 'API Key is required'),
  }).passthrough(),
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const revokeSessionSchema = z.object({
  params: z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
  }),
});