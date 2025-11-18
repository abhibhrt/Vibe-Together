import { z } from 'zod';

const objectId = /^[0-9a-fA-F]{24}$/;

export const playlistValidator = z
    .object({
        couple_id: z
            .string()
            .regex(objectId, 'invalid couple id')
            .optional()
            .nullable(),

        user_id: z
            .string()
            .regex(objectId, 'invalid user id')
            .optional()
            .nullable(),

        playlist_name: z
            .string()
            .trim()
            .min(1, 'playlist name is required'),

        music_ids: z
            .array(z.string().regex(objectId, 'invalid music id'))
            .optional()
            .default([])
    })
    .refine(
        (data) => data.couple_id || data.user_id,
        'either couple_id or user_id is required'
    );

export const playlistUpdateValidator = z.object({
    playlist_name: z.string().trim().optional(),
    add_music: z.string().regex(objectId, 'invalid music id').optional(),
    remove_music: z.string().regex(objectId, 'invalid music id').optional()
});