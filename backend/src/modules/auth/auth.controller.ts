import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { ApiResponse } from '../../common/response.util';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      return ApiResponse.created(res, result, 'Account created successfully');
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.refreshToken || req.body.refreshToken;
      const tokens = await authService.refreshToken(token);
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return ApiResponse.success(res, tokens, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.refreshToken;
      if (token) await authService.logout(token);
      res.clearCookie('refreshToken');
      return ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response) {
    return ApiResponse.success(res, req.user, 'User profile');
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.id, currentPassword, newPassword);
      return ApiResponse.success(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async googleCallback(req: Request, res: Response) {
    const user = req.user as { id: string; email: string; role: string };
    const { generateAccessToken, generateRefreshToken, saveRefreshToken } = await import('../../common/jwt.util');
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    await saveRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
  }
}

export const authController = new AuthController();
