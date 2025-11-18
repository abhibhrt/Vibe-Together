export const setAuthCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.node_env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
    });
};

export const clearAuthCookie = (res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.node_env === 'production',
        sameSite: 'strict',
        path: '/'
    });
};