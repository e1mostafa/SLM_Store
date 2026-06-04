import { Router } from 'express';
import { ordersController } from './orders.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', ordersController.create.bind(ordersController));
router.get('/my', ordersController.getMyOrders.bind(ordersController));
router.get('/my/:id', ordersController.getOne.bind(ordersController));
router.patch('/my/:id/cancel', ordersController.cancel.bind(ordersController));

// Admin routes
router.get('/', authorize('ADMIN'), ordersController.getAll.bind(ordersController));
router.patch('/:id/status', authorize('ADMIN', 'SELLER'), ordersController.updateStatus.bind(ordersController));

export default router;
