import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true
});

// upload buffer to cloudinary
export const uploadBufferToCloudinary = (buffer, type = 'image') => {
  return new Promise((resolve, reject) => {
    try {
      const folder =
        type === 'music' ? 'musics' :
          type === 'avatar' ? 'avatars' :
            'gallery';

      const resource_type =
        type === 'music' ? 'video' :
          'image';

      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(buffer).pipe(stream);
    } catch (err) {
      reject(err);
    }
  });
};

// delete file from cloudinary
export const deleteFromCloudinary = async (publicId, type = 'image') => {
  if (!publicId) throw new Error('public id is required');

  const resource_type = type === 'music' ? 'video' : 'image';

  return cloudinary.uploader.destroy(publicId, { resource_type });
};

export { cloudinary };