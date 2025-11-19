import express from 'express';
import { createCoupleController } from '../controllers/couple.controller/create.couple.js';
import { removeCoupleController } from '../controllers/couple.controller/remove.couple.js';
import { updateCoupleController } from '../controllers/couple.controller/update.couple.js';
import { readCoupleController } from '../controllers/couple.controller/read.couple.js';
import { validateRequest } from '../middlewares/validator.middleware.js';
import { coupleValidator } from '../validators/couple.validator.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

/*
    Couple Route: api/couple/create
*/
router.post('/create', protect, validateRequest(coupleValidator), createCoupleController);

/*
    Couple Route: api/couple/update/:id
*/
router.get('/read', protect, readCoupleController);

/*
    Couple Route: api/couple/update/:id
*/
router.put('/update/:id', protect, updateCoupleController);

/*
    Couple Route: api/couple/remove/:id
*/
router.delete('/remove/:id', protect, removeCoupleController);

export default router;