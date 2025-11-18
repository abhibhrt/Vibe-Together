import jwt from 'jsonwebtoken';

export const assignJwt = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

export const verifyJwt = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
};