import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { prisma } from '../../database/client';
import { ApiResponse } from '../../common/response.util';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

router.get('/product/:productId', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId: req.params.productId, isApproved: true },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, avatar: true } } },
      }),
      prisma.review.count({ where: { productId: req.params.productId, isApproved: true } }),
    ]);
    return ApiResponse.paginated(res, reviews, total, Number(page), Number(limit));
  } catch (error) { next(error); }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { productId, rating, title, content } = req.body;

    // Check if user purchased the product
    const purchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId: req.user!.id, status: 'DELIVERED' },
      },
    });

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: req.user!.id, productId } },
      update: { rating, title, content },
      create: {
        userId: req.user!.id,
        productId,
        rating,
        title,
        content,
        isVerified: !!purchased,
      },
    });

    // Update product rating
    const stats = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: stats._avg.rating || 0,
        reviewCount: stats._count.rating,
      },
    });

    return ApiResponse.created(res, review, 'Review submitted');
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const review = await prisma.review.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!review) throw new AppError('Review not found', 404);
    await prisma.review.delete({ where: { id: req.params.id } });
    return ApiResponse.success(res, null, 'Review deleted');
  } catch (error) { next(error); }
});

export default router;
