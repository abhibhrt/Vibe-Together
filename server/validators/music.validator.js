import { z } from 'zod';

export const musicValidator = z.object({
    music_name: z.string().trim().min(1, 'music name is required'),
    singers: z.string().trim().optional()
});