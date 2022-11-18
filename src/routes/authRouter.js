import { Router } from 'express';
import { loginPost, signupPost } from '../controllers/authController.js';
import { userSchemaValidation } from '../middlewares/userSchemaValidationMiddleware.js';
const router = Router();

router.post('/sign-up', userSchemaValidation, signupPost);
router.post('/login', loginPost);

export default router;