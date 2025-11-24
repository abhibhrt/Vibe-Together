import Requests from '../../models/requests.model.js';

export const createRequestsController = async (req, res) => {
    try {
        const { receiver } = req.parsed;
        const sender = req.user.id;

        const existingRequest = await Requests.findOne({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'you have already sent a request' });
        }

        await Requests.create({
            sender,
            receiver
        });

        return res.status(201).json({
            message: 'request sent successfully'
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};