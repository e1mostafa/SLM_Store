import { Request, Response, NextFunction } from 'express';
import { productsService } from './products.service';
import { ApiResponse } from '../../common/response.util';

export class ProductsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        search: req.query.search as string,
        category: req.query.category as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        rating: req.query.rating ? Number(req.query.rating) : undefined,
        seller: req.query.seller as string,
        sort: req.query.sort as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        isFlashSale: req.query.flashSale === 'true' ? true : undefined,
        isFeatured: req.query.featured === 'true' ? true : undefined,
      };

      const result = await productsService.findAll(filters);
      return ApiResponse.paginated(
        res,
        result.products,
        result.total,
        result.page,
        result.limit
      );
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productsService.findBySlug(
        req.params.slug,
        req.user?.id
      );
      return ApiResponse.success(res, product);
    } catch (error) {
      next(error);
    }
  }

  async getFeatured(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productsService.getFeatured();
      return ApiResponse.success(res, products);
    } catch (error) {
      next(error);
    }
  }

  async getFlashSales(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productsService.getFlashSales();
      return ApiResponse.success(res, products);
    } catch (error) {
      next(error);
    }
  }

  async getRecentlyViewed(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productsService.getRecentlyViewed(req.user!.id);
      return ApiResponse.success(res, products);
    } catch (error) {
      next(error);
    }
  }
}

export const productsController = new ProductsController();
