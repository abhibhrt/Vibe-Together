// Dependencies Imported
import express from 'express';

// Controllers Imported
import { addMusicController } from '../controllers/music.controller/create.music.js';
import { removeMusicController } from '../controllers/music.controller/remove.music.js';
import { getMusic } from '../controllers/music.controller/getresult.music.js';

// Middlewares Imported
import { validateRequest } from '../middlewares/validator.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';

// Validators Imported
import { musicValidator } from '../validators/music.validator.js';


const router = express.Router();

/*
    @route: /api/musics/create
    @desc: add new music
*/
router.post('/create', protect, validateRequest(musicValidator), addMusicController);

/*
    @route: /api/musics/remove/:id
    @desc: remove music
*/
router.delete('/remove/:id', protect, removeMusicController);

/*
    @route: /api/musics/getall
    @desc: get all music
*/
router.get('/getall', getMusic);


export default router;