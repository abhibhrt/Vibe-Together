import { verifyJwt } from '../utils/jwt.util.js';

export const protect = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: 'unauthorized user' });
    }

    const decoded = verifyJwt(token);
    if (!decoded) {
        return res.status(401).json({ message: 'session expired' });
    }

    req.user = decoded;
    next();
};