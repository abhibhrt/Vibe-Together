import Couple from '../../models/couple.model.js';

export const readCoupleController = async (req, res) => {
    try {
        const { id } = req.user;

        const couple = await Couple.find({ receiver: id, duplex: false }).populate('sender', 'name email avatar');

        return res.status(200).json({
            message: 'fetch successful',
            couple
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};