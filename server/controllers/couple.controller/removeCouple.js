import Couple from '../../models/couple.model.js';

export const removeCoupleController = async (req, res) => {
    try {
        const { id } = req.params;

        const removed = await Couple.findByIdAndDelete(id);

        if (!removed) {
            return res.status(404).json({ message: 'couple not found' });
        }

        return res.status(200).json({
            message: 'couple removed'
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};