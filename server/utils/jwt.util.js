import jwt from 'jsonwebtoken';

export const assignJwt = (payload) => {
    return jwt.sign(payload, process.env.jwt_secret, {
        expiresIn: '7d'
    });
};

export const verifyJwt = (token) => {
    try {
        return jwt.verify(token, process.env.jwt_secret);
    } catch {
        return null;
    }
};