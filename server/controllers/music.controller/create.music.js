import Music from '../../models/music.model.js';
import { uploadBufferToCloudinary } from '../../config/cloudinary.config.js';

export const addMusicController = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'file is required' });
        }

        const { music_name, singers } = req.parsed;

        // singers: comma separated -> array
        const singerArray = singers
            ? singers.split(',').map((s) => s.trim())
            : [];

        // upload to cloudinary (music)
        const upload = await uploadBufferToCloudinary(req.file.buffer, 'music');

        const music = await Music.create({
            url: upload.secure_url,
            public_id: upload.public_id,
            music_name,
            singers: singerArray
        });

        return res.status(201).json({
            message: 'music uploaded',
            music
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};