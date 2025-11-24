import Music from '../../models/musics.model.js';

export const getMusic = async (req, res) => {
    try {
        let { page = 1, q = '' } = req.query;

        page = Number(page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const searchFilter = q
            ? {
                $or: [
                    { title: { $regex: q, $options: 'i' } },
                    { artist: { $regex: q, $options: 'i' } }
                ]
            }
            : {};

        const music = await Music.find(searchFilter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Music.countDocuments(searchFilter);

        return res.status(200).json({
            success: true,
            page,
            total,
            music,
        });
    } catch (err) {
        console.error('get music error:', err);
        return res.status(500).json({ message: 'failed to fetch music' });
    }
};