import express from 'express';
import { addMusicController } from '../controllers/music.controller/create.music.js';
import { removeMusicController } from '../controllers/music.controller/remove.music.js';
import { getMusic } from '../controllers/music.controller/getresult.music.js';
import { musicValidator } from '../validators/music.validator.js';
import { validateRequest } from '../middlewares/validator.middleware.js';
import { uploadMusic } from '../middlewares/upload.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

/*
    Music Add Route: api/music/create
*/
router.post('/create', protect, uploadMusic, validateRequest(musicValidator), addMusicController);

/*
    Music Remove Route: api/music/remove/id
*/
router.delete('/remove/:id', protect, removeMusicController);

/*
    Music Get Route: api/music/
*/
router.get('/', getMusic);

export default router;