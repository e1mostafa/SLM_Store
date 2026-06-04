import bcrypt from 'bcryptjs';
import { prisma } from '../../database/client';
import { AppError } from '../../middleware/errorHandler';
import {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  revokeRefreshToken,
  verifyRefreshToken,
} from '../../common/jwt.util';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export class AuthService {
  async register(dto: RegisterDto) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new AppError('Email already registered', 409);

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        avatar: true,
        isActive: true,
      },
    });

    if (!user || !user.password) throw new AppError('Invalid credentials', 401);
    if (!user.isActive) throw new AppError('Account suspended', 403);

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw new AppError('Invalid credentials', 401);

    const { password: _, ...safeUser } = user;
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user: safeUser, ...tokens };
  }

  async refreshToken(token: string) {
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) throw new AppError('Unauthorized', 401);

    await revokeRefreshToken(token);
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return tokens;
  }

  async logout(token: string) {
    await revokeRefreshToken(token).catch(() => {});
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password) throw new AppError('No password set', 400);

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new AppError('Current password is incorrect', 400);

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    await saveRefreshToken(userId, refreshToken);
    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
