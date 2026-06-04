import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../database/client';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// FIX: expiresIn from env is string, but newer @types/jsonwebtoken requires StringValue type.
// Cast to SignOptions['expiresIn'] to satisfy the type checker.
export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', options);
}

export function generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh-secret', options);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret') as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as TokenPayload;
}

export async function saveRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}
