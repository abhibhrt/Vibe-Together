import express from 'express';
import { createCoupleController } from '../controllers/couple.controller/createCouple.js';
import { removeCoupleController } from '../controllers/couple.controller/removeCouple.js';
import { validateRequest } from '../middlewares/validator.middleware.js';
import { coupleValidator } from '../validators/couple.validator.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

/*
    Couple Route: api/couple/create
*/
router.post('/create', protect, validateRequest(coupleValidator), createCoupleController);

/*
    Couple Route: api/couple/remove/id
*/
router.delete('/remove/:id', protect, removeCoupleController);

export default router;