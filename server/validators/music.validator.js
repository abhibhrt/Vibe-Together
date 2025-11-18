import { url, z } from 'zod';

export const musicValidator = z.object({
    url: z.string().trim(),
    music_name: z.string().trim().min(1, 'music name is required'),
    singers: z.string().trim().optional()
});