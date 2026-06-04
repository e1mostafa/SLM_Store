import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { prisma } from '../../database/client';
import { ApiResponse } from '../../common/response.util';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

// ⚠️ FIX: All protected routes MUST come before the /:slug catch-all route,
// otherwise GET /dashboard/stats, /register etc. would be captured by /:slug.
// Protected routes - Seller only
router.post('/register', authenticate, authorize('CUSTOMER'), async (req, res, next) => {
  try {
    const existing = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (existing) throw new AppError('Already registered as seller', 409);

    const slug = req.body.storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const seller = await prisma.seller.create({
      data: {
        userId: req.user!.id,
        storeName: req.body.storeName,
        storeSlug: slug,
        description: req.body.description,
      },
    });

    await prisma.user.update({ where: { id: req.user!.id }, data: { role: 'SELLER' } });
    return ApiResponse.created(res, seller, 'Seller registration submitted for approval');
  } catch (error) { next(error); }
});

router.get('/dashboard/stats', authenticate, authorize('SELLER'), async (req, res, next) => {
  try {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (!seller) throw new AppError('Seller profile not found', 404);

    const [totalProducts, totalOrders, revenueResult, recentOrders] = await Promise.all([
      prisma.product.count({ where: { sellerId: seller.id } }),
      prisma.orderItem.count({ where: { sellerId: seller.id } }),
      prisma.orderItem.aggregate({
        where: {
          sellerId: seller.id,
          order: { paymentStatus: 'PAID' },
        },
        _sum: { subtotal: true },
      }),
      prisma.orderItem.findMany({
        where: { sellerId: seller.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          order: { include: { user: { select: { name: true } } } },
          product: { select: { name: true, thumbnail: true } },
        },
      }),
    ]);

    return ApiResponse.success(res, {
      totalProducts,
      totalOrders,
      totalRevenue: revenueResult._sum.subtotal || 0,
      recentOrders,
    });
  } catch (error) { next(error); }
});

router.get('/dashboard/products', authenticate, authorize('SELLER'), async (req, res, next) => {
  try {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (!seller) throw new AppError('Seller profile not found', 404);

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { sellerId: seller.id },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { name: true } } },
      }),
      prisma.product.count({ where: { sellerId: seller.id } }),
    ]);

    return ApiResponse.paginated(res, products, total, Number(page), Number(limit));
  } catch (error) { next(error); }
});

router.post('/products', authenticate, authorize('SELLER'), async (req, res, next) => {
  try {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (!seller || seller.status !== 'APPROVED') throw new AppError('Seller not approved', 403);

    const slug = req.body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
    const product = await prisma.product.create({
      data: {
        ...req.body,
        sellerId: seller.id,
        slug,
        status: 'DRAFT',
      },
    });
    return ApiResponse.created(res, product);
  } catch (error) { next(error); }
});

router.patch('/products/:id', authenticate, authorize('SELLER'), async (req, res, next) => {
  try {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (!seller) throw new AppError('Seller profile not found', 404);

    const product = await prisma.product.findFirst({
      where: { id: req.params.id, sellerId: seller.id },
    });
    if (!product) throw new AppError('Product not found', 404);

    const updated = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
    return ApiResponse.success(res, updated);
  } catch (error) { next(error); }
});

// Public routes - /:slug MUST be LAST to avoid swallowing specific routes above
router.get('/:slug', async (req, res, next) => {
  try {
    const seller = await prisma.seller.findUnique({
      where: { storeSlug: req.params.slug },
      include: {
        user: { select: { name: true, avatar: true, createdAt: true } },
        _count: { select: { products: true } },
      },
    });
    if (!seller) throw new AppError('Seller not found', 404);
    return ApiResponse.success(res, seller);
  } catch (error) { next(error); }
});

export default router;
