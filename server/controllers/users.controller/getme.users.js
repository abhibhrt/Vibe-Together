import User from '../../models/users.model.js';

export const meController = async (req, res) => {
    try {
        const { id } = req.user;
        const user = await User.findOne({ _id: id });
        return res.status(200).json({
            message: 'welcome back',
            user:{
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        })
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
}