import { Router } from 'express';
import { productsController } from './products.controller';
import { authenticate, optionalAuth } from '../../middleware/auth';

const router = Router();

router.get('/', optionalAuth, productsController.getAll.bind(productsController));
router.get('/featured', productsController.getFeatured.bind(productsController));
router.get('/flash-sales', productsController.getFlashSales.bind(productsController));
router.get('/recently-viewed', authenticate, productsController.getRecentlyViewed.bind(productsController));
router.get('/:slug', optionalAuth, productsController.getOne.bind(productsController));

export default router;
