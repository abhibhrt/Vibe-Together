import Couple from '../../models/couple.model.js';

export const createCoupleController = async (req, res) => {
    try {
        const { receiver } = req.parsed;
        const sender = req.user.id;

        const existingCouple = await Couple.findOne({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        });

        if (existingCouple) {
            return res.status(400).json({ message: 'Couple request already exists' });
        }

        await Couple.create({
            sender,
            receiver
        });

        return res.status(201).json({
            message: 'couple request sent'
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};