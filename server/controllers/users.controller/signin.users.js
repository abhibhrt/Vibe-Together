// Modules Imported
import User from '../../models/users.model.js';
import { matchPassword } from '../../utils/hash.utils.js';
import { assignJwt } from '../../utils/jwt.util.js';
import { setAuthCookie } from '../../utils/cookie.util.js';

export const signinController = async (req, res) => {
    try {
        const { email, password } = req.parsed;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }

        const isValid = await matchPassword(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'password not match' });
        }

        const token = assignJwt({ id: user._id });
        setAuthCookie(res, token);

        return res.status(200).json({
            message: 'login successful',
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