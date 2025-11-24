import Requests from '../../models/requests.model.js';

export const removeRequestsController = async (req, res) => {
    try {
        const { id } = req.params;

        const removed = await Requests.findByIdAndDelete(id);
        if (!removed) {
            return res.status(404).json({ message: 'request not found' });
        }

        return res.status(200).json({
            message: 'request removed'
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};