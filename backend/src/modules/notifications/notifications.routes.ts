import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { prisma } from '../../database/client';
import { ApiResponse } from '../../common/response.util';

// FIX: notifications router was incorrectly defined inside coupons.routes.ts
// and re-exported from there. It now lives in its own file.
const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user!.id, isRead: false },
    });
    return ApiResponse.success(res, { notifications, unreadCount });
  } catch (error) { next(error); }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });
    return ApiResponse.success(res, null, 'All notifications marked as read');
  } catch (error) { next(error); }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    return ApiResponse.success(res, null, 'Notification marked as read');
  } catch (error) { next(error); }
});

export default router;
