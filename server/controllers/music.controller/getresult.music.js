import Music from '../../models/musics.model.js';

export const getMusic = async (req, res) => {
    try {
        const music = await Music.find({})
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: music.length,
            music,
        });
    } catch (err) {
        console.error('get music error:', err);
        return res.status(500).json({ message: 'failed to fetch music' });
    }
};