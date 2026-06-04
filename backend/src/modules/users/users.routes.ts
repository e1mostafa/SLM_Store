import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { prisma } from '../../database/client';
import { ApiResponse } from '../../common/response.util';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

router.use(authenticate);

// Get profile
router.get('/profile', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, name: true, email: true, avatar: true, phone: true,
        role: true, isEmailVerified: true, createdAt: true,
        seller: { select: { id: true, storeName: true, storeSlug: true, status: true } },
        _count: { select: { orders: true, reviews: true, wishlistItems: true } },
      },
    });
    return ApiResponse.success(res, user);
  } catch (error) { next(error); }
});

// Update profile
router.patch('/profile', async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, phone, avatar },
      select: { id: true, name: true, email: true, avatar: true, phone: true },
    });
    return ApiResponse.success(res, user, 'Profile updated');
  } catch (error) { next(error); }
});

// Addresses
router.get('/addresses', async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({ where: { userId: req.user!.id } });
    return ApiResponse.success(res, addresses);
  } catch (error) { next(error); }
});

router.post('/addresses', async (req, res, next) => {
  try {
    const { isDefault, ...data } = req.body;
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id },
        data: { isDefault: false },
      });
    }
    const address = await prisma.address.create({
      data: { ...data, isDefault, userId: req.user!.id },
    });
    return ApiResponse.created(res, address);
  } catch (error) { next(error); }
});

router.put('/addresses/:id', async (req, res, next) => {
  try {
    const addr = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!addr) throw new AppError('Address not found', 404);
    if (req.body.isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
    }
    const updated = await prisma.address.update({ where: { id: req.params.id }, data: req.body });
    return ApiResponse.success(res, updated);
  } catch (error) { next(error); }
});

router.delete('/addresses/:id', async (req, res, next) => {
  try {
    const addr = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!addr) throw new AppError('Address not found', 404);
    await prisma.address.delete({ where: { id: req.params.id } });
    return ApiResponse.success(res, null, 'Address deleted');
  } catch (error) { next(error); }
});

export default router;
