import { z } from 'zod';

export const coupleValidator = z.object({
    receiver: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'invalid receiver id'),
    duplex: z
        .boolean().optional()
});