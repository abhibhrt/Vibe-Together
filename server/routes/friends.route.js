import express from 'express';

import { getChat, createOrGetChatRoom, sendMessage } from '../controllers/friends.controller/communication.friends.js';
import { getFriendsController } from '../controllers/friends.controller/get.friends.js';

import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();


router.get('/chat/:friendId', protect, getChat);
router.post('/chat/:friendId', protect, createOrGetChatRoom);
router.post('/message/:roomId', protect, sendMessage);

/*
    @route: /api/friends/getall
    @desc: get all friends
*/
router.get('/getall', protect, getFriendsController);

export default router;