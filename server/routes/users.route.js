// Dependencies Imported
import express from 'express';

// Controllers Imported
import { signupController } from '../controllers/users.controller/signup.users.js';
import { signinController } from '../controllers/users.controller/signin.users.js';
import { signoutController } from '../controllers/users.controller/signout.users.js';
import { meController } from '../controllers/users.controller/getme.users.js';
import { updateController } from '../controllers/users.controller/update.users.js';
import { allUserController } from '../controllers/users.controller/getall.users.js';

// Middlewares Imported
import { validateRequest } from '../middlewares/validator.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { uploadAvatar } from '../middlewares/upload.middleware.js';

// Validators Imported
import { userValidatorSignUp, userValidatorSignIn } from '../validators/user.validator.js';

const router = express.Router();

/*
    @route: /api/users/signup
    @desc: register new user
*/
router.post('/signup', validateRequest(userValidatorSignUp), signupController);

/*
    @route: /api/users/signin
    @desc: login existing user
*/
router.post('/signin', validateRequest(userValidatorSignIn), signinController);

/*
    @route: /api/users/signout
    @desc: logout user
*/
router.post('/signout', signoutController);

/*
    @route: /api/users/update
    @desc: update user profile
*/
router.put('/update', protect, uploadAvatar, updateController);

/*
    @route: /api/users/getme
    @desc: get current logged in user
*/
router.get('/getme', protect, meController);

/*
    @route: /api/users/getall
    @desc: get all users
*/
router.get('/getall', protect, allUserController);


export default router;