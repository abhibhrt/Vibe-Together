import Requests from '../../models/requests.model.js';
import Friends from '../../models/friends.model.js';

export const addFriendsController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const request = await Requests.findOne({
            _id: id,
            receiver: userId
        });

        if (!request) {
            return res.status(404).json({ message: 'request not found' });
        }

        const alreadyFriends = await Friends.findOne({
            $or: [
                { friend1: userId, friend2: request.sender },
                { friend1: request.sender, friend2: userId }
            ]
        });

        if (alreadyFriends) {
            return res.status(400).json({ message: 'already friends' });
        }

        const newFriend = await Friends.create({
            friend1: userId,
            friend2: request.sender
        });

        await Requests.findByIdAndUpdate(id, { duplex: true });

        return res.status(201).json({
            message: 'friend added',
            friend: newFriend
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};