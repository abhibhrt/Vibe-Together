import Music from '../../models/music.model.js';
import { deleteFromCloudinary } from '../../config/cloudinary.config.js';

export const removeMusicController = async (req, res) => {
    try {
        const { id } = req.params;

        const music = await Music.findById(id);
        if (!music) {
            return res.status(404).json({ message: 'music not found' });
        }

        await deleteFromCloudinary(music.public_id, 'music');
        await Music.findByIdAndDelete(id);

        return res.status(200).json({
            message: 'music removed'
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
