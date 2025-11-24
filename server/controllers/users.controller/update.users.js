import { deleteFromCloudinary, uploadBufferToCloudinary } from '../../config/cloudinary.config.js';
import User from '../../models/users.model.js';

export const updateController = async (req, res) => {
  try {
    const { id } = req.user;

    // file hona required nahi, name/email update bhi allow kar sakte hain
    const isAvatarUpdate = req.file ? true : false;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }

    let uploadedAvatar = null;

    if (isAvatarUpdate) {
      // delete old avatar
      if (user.avatar?.public_id) {
        try {
          await deleteFromCloudinary(user.avatar.public_id, 'avatar');
        } catch (err) {
          console.warn('failed to delete old avatar:', err.message);
        }
      }

      // upload new avatar (buffer required)
      uploadedAvatar = await uploadBufferToCloudinary(req.file.buffer, 'avatar');

      user.avatar = {
        url: uploadedAvatar.secure_url,
        public_id: uploadedAvatar.public_id
      };
    }

    // optional fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;

    await user.save();

    return res.status(200).json({
      message: 'profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }
    });

  } catch (err) {
    console.error('error updating profile:', err);
    return res.status(500).json({ message: err.message });
  }
};