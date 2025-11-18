import Playlist from '../../models/playlist.model.js';

export const removePlaylistController = async (req, res) => {
    try {
        const { id } = req.params;

        const removed = await Playlist.findByIdAndDelete(id);

        if (!removed) {
            return res.status(404).json({ message: 'playlist not found' });
        }

        return res.status(200).json({
            message: 'playlist removed'
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};