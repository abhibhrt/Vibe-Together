import Playlist from '../../models/playlist.model.js';

export const createPlaylistController = async (req, res) => {
    try {
        const { couple_id, user_id, playlist_name, music_ids } = req.parsed;

        const playlist = await Playlist.create({
            couple_id: couple_id || null,
            user_id: user_id || null,
            playlist_name,
            music_ids: music_ids || []
        });

        return res.status(201).json({
            message: 'playlist created',
            playlist
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};