import Friends from '../../models/friends.model.js';

export const getFriendsController = async (req, res) => {
    try {
        const userId = req.user.id;

        const friends = await Friends.find({
            $or: [
                { friend1: userId },
                { friend2: userId }
            ]
        })
            .populate('friend1', 'name email avatar')
            .populate('friend2', 'name email avatar');

        // remove broken friendships
        const cleaned = friends.filter(item =>
            item.friend1 !== null &&
            item.friend2 !== null &&
            item.friend1._id &&
            item.friend2._id
        );

        // format correct response
        const formatted = cleaned.map(item => {
            const friend =
                item.friend1._id.toString() === userId
                    ? item.friend2
                    : item.friend1;

            return { friend };
        });

        return res.status(200).json({
            message: 'fetch successful',
            friends: formatted
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
