import express from 'express';

import { getChat, createOrGetChatRoom, sendMessage } from '../controllers/friends.controller/communication.friends.js';
import { getFriendsController } from '../controllers/friends.controller/get.friends.js';

import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

/*
    @route: /api/friends/chat/:friendId
    @desc: get chat with a friend
*/
router.get('/chat/:friendId', protect, getChat);

/*
    @route: /api/friends/chat/:friendId
    @desc: create or get chat room with a friend
*/
router.post('/chat/:friendId', protect, createOrGetChatRoom);

/*
    @route: /api/friends/message/:roomId
    @desc: send message to a chat room
*/
router.post('/message/:roomId', protect, sendMessage);

/*
    @route: /api/friends/getall
    @desc: get all friends
*/
router.get('/getall', protect, getFriendsController);

export default router;