import Playlist from '../../models/playlist.model.js';

export const updatePlaylistController = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            add_music,
            remove_music,
            playlist_name
        } = req.parsed;

        const playlist = await Playlist.findById(id);
        if (!playlist) {
            return res.status(404).json({ message: 'playlist not found' });
        }

        // update playlist name
        if (playlist_name) {
            playlist.playlist_name = playlist_name;
        }

        // add music
        if (add_music) {
            if (!playlist.music_ids.includes(add_music)) {
                playlist.music_ids.push(add_music);
            }
        }

        // remove music
        if (remove_music) {
            playlist.music_ids = playlist.music_ids.filter(
                (mid) => mid.toString() !== remove_music
            );
        }

        await playlist.save();

        return res.status(200).json({
            message: 'playlist updated',
            playlist
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};