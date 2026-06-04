import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { prisma } from '../../database/client';
import { ApiResponse } from '../../common/response.util';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          select: {
            id: true, name: true, slug: true, price: true, comparePrice: true,
            thumbnail: true, rating: true, reviewCount: true, stock: true,
            isFlashSale: true, flashSalePrice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return ApiResponse.success(res, items);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { productId } = req.body;
    const item = await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: req.user!.id, productId } },
      update: {},
      create: { userId: req.user!.id, productId },
    });
    return ApiResponse.created(res, item, 'Added to wishlist');
  } catch (error) { next(error); }
});

router.delete('/:productId', async (req, res, next) => {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user!.id, productId: req.params.productId },
    });
    return ApiResponse.success(res, null, 'Removed from wishlist');
  } catch (error) { next(error); }
});

export default router;
