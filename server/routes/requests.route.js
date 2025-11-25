// Dependencies Imported
import express from 'express';

// Controllers Imported
import { createRequestsController } from '../controllers/request.controller/create.request.js';
import { removeRequestsController } from '../controllers/request.controller/remove.request.js';
import { addFriendsController } from '../controllers/friends.controller/add.friends.js';
import { getRequestsController } from '../controllers/request.controller/read.request.js';

// Middlewares Imported
import { validateRequest } from '../middlewares/validator.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';

// Validators Imported
import { requestValidator } from '../validators/request.validator.js';


const router = express.Router();

/*
    @route: /api/requests/create
    @desc: create new request
*/
router.post('/create', protect, validateRequest(requestValidator), createRequestsController);

/*
    @route: /api/requests/read
    @desc: get all requests
*/
router.get('/read', protect, getRequestsController);

/*
    @route: /api/requests/update/:id
    @desc: update request
*/
router.put('/update/:id', protect, addFriendsController);

/*
    @route: /api/requests/remove/:id
    @desc: remove request
*/
router.delete('/remove/:id', protect, removeRequestsController);


export default router;