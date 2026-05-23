import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { verifyToken } from '../middlewares/auth.middleware';
import { runValidation } from '../middlewares/validate.middleware';
import { loginValidator } from '../middlewares/validators/auth.validators';
import { asyncHandler } from '../utils/asyncHandler';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post(
  '/login',
  authLimiter,
  loginValidator,
  runValidation,
  asyncHandler(AuthController.login)
);

router.get('/me', verifyToken, asyncHandler(AuthController.me));

router.post('/logout', verifyToken, asyncHandler(AuthController.logout));

export default router;
