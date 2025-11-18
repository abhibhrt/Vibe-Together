import multer from 'multer';

const storage = multer.memoryStorage();

const uploadAvatarMiddleware = multer({ storage }).single('avatar');

export const uploadAvatar = (req, res, next) => {
    uploadAvatarMiddleware(req, res, (err) => {
        if (err) {
            return next(err);
        }
        next();
    });
};

const uploadMusicMiddleware = multer({ storage }).single('audio');

export const uploadMusic = (req, res, next) => {
    uploadMusicMiddleware(req, res, (err) => {
        if (err) {
            return next(err);
        }
        next();
    });
};