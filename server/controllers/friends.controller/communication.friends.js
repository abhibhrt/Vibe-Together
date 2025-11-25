import Friends from '../../models/friends.model.js';

export const getChat = async (req, res) => {
    try {
        const userId = req.user.id;
        const friendId = req.params.friendId;

        const chat = await Friends.findOne({
            $or: [
                { friend1: userId, friend2: friendId },
                { friend1: friendId, friend2: userId }
            ]
        }).populate({
            path: 'messages.sender',
            select: 'name email _id'
        });

        if (!chat) return res.status(200).json([]);

        return res.status(200).json(chat.messages);
    } catch (err) {
        return res.status(500).json({ message: 'server error' });
    }
};

export const createOrGetChatRoom = async (req, res) => {
    try {
        const userId = req.user.id;
        const friendId = req.params.friendId;

        let chat = await Friends.findOne({
            $or: [
                { friend1: userId, friend2: friendId },
                { friend1: friendId, friend2: userId }
            ]
        });

        if (!chat) {
            chat = await Friends.create({
                friend1: userId,
                friend2: friendId,
                messages: []
            });
        }

        return res.status(200).json({ roomId: chat._id });
    } catch (err) {
        return res.status(500).json({ message: 'server error' });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { content } = req.body;
        const { roomId } = req.params;

        if (!content) {
            return res.status(400).json({ message: 'content required' });
        }

        const newMessage = {
            sender: userId,
            content,
            timestamp: new Date()
        };

        await Friends.findByIdAndUpdate(roomId, {
            $push: { messages: newMessage }
        });

        // ⭐ EMIT REALTIME FROM CONTROLLER
        req.io.to(roomId).emit("serverMessage", newMessage);

        return res.status(200).json(newMessage);

    } catch (err) {
        return res.status(500).json({ message: 'server error' });
    }
};
