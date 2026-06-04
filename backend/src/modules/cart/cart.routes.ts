import { Request, Response, NextFunction } from 'express';
import { cartService } from './cart.service';
import { ApiResponse } from '../../common/response.util';

class CartController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.getCart(req.user!.id);
      return ApiResponse.success(res, cart);
    } catch (error) { next(error); }
  }

  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, quantity = 1, variantId } = req.body;
      const item = await cartService.addItem(req.user!.id, productId, quantity, variantId);
      return ApiResponse.created(res, item, 'Added to cart');
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await cartService.updateItem(req.user!.id, req.params.id, req.body.quantity);
      return ApiResponse.success(res, result, 'Cart updated');
    } catch (error) { next(error); }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await cartService.removeItem(req.user!.id, req.params.id);
      return ApiResponse.success(res, null, 'Item removed from cart');
    } catch (error) { next(error); }
  }

  async clear(req: Request, res: Response, next: NextFunction) {
    try {
      await cartService.clearCart(req.user!.id);
      return ApiResponse.success(res, null, 'Cart cleared');
    } catch (error) { next(error); }
  }
}

import { Router } from 'express';
import { authenticate } from '../../middleware/auth';

const router = Router();
const cartController = new CartController();

router.use(authenticate);
router.get('/', cartController.get.bind(cartController));
router.post('/', cartController.add.bind(cartController));
router.patch('/:id', cartController.update.bind(cartController));
router.delete('/:id', cartController.remove.bind(cartController));
router.delete('/', cartController.clear.bind(cartController));

export default router;
