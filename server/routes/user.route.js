// Modules Imported
import express from 'express';
import { signupController } from '../controllers/user.controller/signup.js';
import { signinController } from '../controllers/user.controller/signin.js';
import { signoutController } from '../controllers/user.controller/signout.js';
import { meController } from '../controllers/user.controller/me.user.js';
import { updateController } from '../controllers/user.controller/update.user.js';
import { validateRequest } from '../middlewares/validator.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { userValidatorSignUp, userValidatorSignIn } from '../validators/user.validator.js';
import { uploadAvatar } from '../middlewares/upload.middleware.js';

const router = express.Router();

/*
    User SignUp Route: api/user/signup
*/
router.post('/signup', validateRequest(userValidatorSignUp), signupController);

/*
    User SignUp Route: api/user/signin
*/
router.post('/signin', validateRequest(userValidatorSignIn), signinController);

/*
    User SignOut Route: api/user/signout
*/
router.post('/signout', signoutController);

/*
    User Edit Route: api/user/update
*/
router.put('/update', protect, uploadAvatar, updateController);

/*
    User Auth Check Route: api/user/me
*/
router.get('/me', protect, meController);

export default router;