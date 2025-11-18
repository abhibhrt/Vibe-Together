import { z } from 'zod';

export const userValidatorSignUp = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email(),
    password: z
        .string()
        .min(6, 'password must be at least 6 characters'),
    name: z
        .string()
        .trim()
        .min(1, 'name is required'),
    avatar: z.object({
        url: z.string().url().optional().default(''),
        public_id: z.string().optional().default('')
    }).optional()
});

export const userValidatorSignIn = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email(),
    password: z
        .string()
        .min(6, 'password must be at least 6 characters'),
    avatar: z.object({
        url: z.string().url().optional().default(''),
        public_id: z.string().optional().default('')
    }).optional()
});