import Requests from '../../models/requests.model.js';

export const getRequestsController = async (req, res) => {
    try {
        const { id } = req.user;

        const request = await Requests.find({ receiver: id, duplex: false }).populate('sender', 'name email avatar');

        return res.status(200).json({
            message: 'fetch successful',
            requests: request
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};