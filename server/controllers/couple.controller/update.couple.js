import Couple from '../../models/couple.model.js';

export const updateCoupleController = async (req, res) => {
    try {
        const { id } = req.params;

        const couple = await Couple.findByIdAndUpdate(id, { duplex: true }, { new: true });

        return res.status(201).json({
            message: 'couple created',
            couple
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};