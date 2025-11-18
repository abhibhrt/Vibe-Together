import Music from '../../models/music.model.js';

export const addMusicController = async (req, res) => {
    try {
        const { url, music_name, singers } = req.parsed;

        const singerArray = singers
            ? singers.split(',').map((s) => s.trim())
            : [];

        const music = await Music.create({
            url,
            music_name,
            singers: singerArray
        });

        return res.status(201).json({
            message: 'music uploaded successfully',
            music
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};