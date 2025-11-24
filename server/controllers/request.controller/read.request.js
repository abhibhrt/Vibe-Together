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

export const getFriendsController = async (req, res) => {
    try {
        const { id } = req.user;

        const requests = await Requests.find({
            duplex: true,
            $or: [
                { sender: id },
                { receiver: id }
            ]
        });

        const populated = await Promise.all(
            requests.map(async (item) => {
                if (item.sender.toString() === id) {
                    return await item.populate('receiver', 'name email avatar');
                }
                return await item.populate('sender', 'name email avatar');
            })
        );

        return res.status(200).json({
            message: 'fetch successful',
            friends: populated
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
