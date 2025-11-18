import { clearAuthCookie } from '../../utils/cookie.util.js';

export const signoutController = async (req, res) => {
  try {
    clearAuthCookie(res);

    return res.status(200).json({
      message: 'signed out successfully'
    });
  } catch (err) {
    return res.status(500).json({ message: 'server error' });
  }
};