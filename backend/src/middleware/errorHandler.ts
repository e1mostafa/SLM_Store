import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public errors?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // FIX: Prisma error cast should go through unknown to avoid TypeScript overlap error
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as unknown as { code: string; meta?: { field_name?: string } };
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: `${prismaError.meta?.field_name || 'Field'} already exists`,
      });
    }
    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}
