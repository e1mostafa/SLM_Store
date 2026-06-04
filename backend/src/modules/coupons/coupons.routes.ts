import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { prisma } from '../../database/client';
import { ApiResponse } from '../../common/response.util';
import { AppError } from '../../middleware/errorHandler';

// FIX: Removed the notificationRouter that was incorrectly defined here.
// It now lives in its own notifications/notifications.routes.ts file.
const router = Router();

router.post('/validate', authenticate, async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (!coupon) throw new AppError('Invalid or expired coupon', 400);
    if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
      throw new AppError(`Minimum order amount is EGP ${coupon.minOrderAmount}`, 400);
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
    } else {
      discount = Number(coupon.discountValue);
    }

    return ApiResponse.success(res, {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
    });
  } catch (error) { next(error); }
});

// Admin coupon management
router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    return ApiResponse.success(res, coupons);
  } catch (error) { next(error); }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const coupon = await prisma.coupon.create({ data: req.body });
    return ApiResponse.created(res, coupon);
  } catch (error) { next(error); }
});

export default router;
