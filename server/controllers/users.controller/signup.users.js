import User from '../../models/users.model.js';
import { hashPassword } from '../../utils/hash.utils.js';
import { assignJwt } from '../../utils/jwt.util.js';
import { setAuthCookie } from '../../utils/cookie.util.js';

export const signupController = async (req, res) => {
    try {
        const parsed = req.parsed;

        const existing = await User.findOne({ email: parsed.email });
        if (existing) {
            return res.status(400).json({ message: 'email already exists' });
        }

        const hashed = await hashPassword(parsed.password);

        const user = await User.create({
            email: parsed.email,
            password: hashed,
            name: parsed.name,
            avatar: parsed.avatar || { url: '', public_id: '' }
        });

        const token = assignJwt({ id: user._id });
        setAuthCookie(res, token);

        return res.status(201).json({
            message: 'user created',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar
            }
        });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};