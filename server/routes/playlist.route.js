import express from 'express';
import { createPlaylistController } from '../controllers/playlist.controller/create.playlist.js';
import { removePlaylistController } from '../controllers/playlist.controller/remove.playlist.js';
import { updatePlaylistController } from '../controllers/playlist.controller/update.playlist.js';
import { playlistValidator, playlistUpdateValidator } from '../validators/playlist.validator.js';
import { validateRequest } from '../middlewares/validator.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

/*
    Playlist Create Route: api/playlist/create
*/
router.post('/create', protect, validateRequest(playlistValidator), createPlaylistController);

/*
    Playlist Remove Route: api/playlist/remove/id
*/
router.delete('/remove/:id', protect, removePlaylistController);

/*
    Playlist Update Route: api/playlist/ypdate/id
*/
router.put('/update/:id', protect, validateRequest(playlistUpdateValidator), updatePlaylistController)

export default router;