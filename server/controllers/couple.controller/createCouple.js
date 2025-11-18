import Couple from '../../models/couple.model.js';

export const createCoupleController = async (req, res) => {
    try {
        const { user1, user2, couple_name } = req.parsed;

        const couple = await Couple.create({
            user1,
            user2,
            couple_name
        });

        return res.status(201).json({
            message: 'couple created',
            couple
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};