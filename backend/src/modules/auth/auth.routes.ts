import { Router } from 'express';
import passport from 'passport';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.get('/me', authenticate, authController.me.bind(authController));
router.post('/change-password', authenticate, authController.changePassword.bind(authController));

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.googleCallback.bind(authController)
);

export default router;
