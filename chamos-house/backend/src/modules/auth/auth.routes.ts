import { Router } from 'express';
import { AuthController } from '../auth/auth.controller';
import { verifyToken } from '../../core/middlewares/auth.middleware';
import { runValidation } from '../../core/middlewares/validate.middleware';
import { loginValidator } from '..//auth/auth.validators';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { authLimiter } from '../../core/middlewares/rateLimiter';

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
