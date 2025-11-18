import { z } from 'zod';

export const coupleValidator = z.object({
    user1: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'invalid user1 id'),
    user2: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'invalid user2 id'),
    couple_name: z
        .string()
        .trim()
        .min(1, 'couple name is required')
});