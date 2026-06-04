import { Request, Response, NextFunction } from 'express';
import { ordersService } from './orders.service';
import { ApiResponse } from '../../common/response.util';

export class OrdersController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await ordersService.create(req.user!.id, req.body);
      return ApiResponse.created(res, order, 'Order placed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ordersService.findByUser(
        req.user!.id,
        Number(req.query.page) || 1,
        Number(req.query.limit) || 10
      );
      return ApiResponse.paginated(res, result.orders, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await ordersService.findById(req.params.id, req.user!.id);
      return ApiResponse.success(res, order);
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await ordersService.cancel(req.params.id, req.user!.id);
      return ApiResponse.success(res, order, 'Order cancelled');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ordersService.getAll(
        Number(req.query.page) || 1,
        Number(req.query.limit) || 20,
        req.query.status as string
      );
      return ApiResponse.paginated(res, result.orders, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await ordersService.updateStatus(req.params.id, req.body.status);
      return ApiResponse.success(res, order, 'Order status updated');
    } catch (error) {
      next(error);
    }
  }
}

export const ordersController = new OrdersController();
