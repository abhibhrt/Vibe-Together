import User from '../../models/user.model.js';

export const allUserController = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        return res.status(200).json({
            message: 'all users fetched successfully',
            users: users
        })
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
}