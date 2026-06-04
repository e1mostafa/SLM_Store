import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created<T>(res: Response, data: T, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  static error(res: Response, message: string, statusCode = 400, errors?: unknown) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  static unauthorized(res: Response, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message = 'Not found') {
    return this.error(res, message, 404);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message = 'Success'
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  }
}
