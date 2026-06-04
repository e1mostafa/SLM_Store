import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { prisma } from '../../database/client';
import { ApiResponse } from '../../common/response.util';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

// Dashboard stats
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalSellers,
      revenueResult,
      recentOrders,
      pendingSellers,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.seller.count({ where: { status: 'APPROVED' } }),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.seller.count({ where: { status: 'PENDING' } }),
    ]);

    return ApiResponse.success(res, {
      totalUsers,
      totalOrders,
      totalProducts,
      totalSellers,
      totalRevenue: revenueResult._sum.total || 0,
      recentOrders,
      pendingSellers,
    });
  } catch (error) { next(error); }
});

// Users management
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, role: true, avatar: true,
          isActive: true, createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return ApiResponse.paginated(res, users, total, Number(page), Number(limit));
  } catch (error) { next(error); }
});

router.patch('/users/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    return ApiResponse.success(res, user, 'User updated');
  } catch (error) { next(error); }
});

// Sellers management
router.get('/sellers', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = status ? { status: status as never } : {};
    const [sellers, total] = await Promise.all([
      prisma.seller.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true, avatar: true } },
          _count: { select: { products: true } },
        },
      }),
      prisma.seller.count({ where }),
    ]);
    return ApiResponse.paginated(res, sellers, total, Number(page), Number(limit));
  } catch (error) { next(error); }
});

router.patch('/sellers/:id/status', async (req, res, next) => {
  try {
    const seller = await prisma.seller.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    return ApiResponse.success(res, seller, 'Seller status updated');
  } catch (error) { next(error); }
});

// Products management
router.get('/products', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          seller: { select: { storeName: true } },
          category: { select: { name: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);
    return ApiResponse.paginated(res, products, total, Number(page), Number(limit));
  } catch (error) { next(error); }
});

router.patch('/products/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return ApiResponse.success(res, product, 'Product updated');
  } catch (error) { next(error); }
});

// Revenue analytics
router.get('/analytics/revenue', async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: since }, paymentStatus: 'PAID' },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const revenueByDay = orders.reduce((acc: Record<string, number>, order: { createdAt: Date; total: unknown }) => {
      const day = order.createdAt.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + Number(order.total);
      return acc;
    }, {});

    return ApiResponse.success(res, revenueByDay);
  } catch (error) { next(error); }
});

// Banners management
router.get('/banners', async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
    return ApiResponse.success(res, banners);
  } catch (error) { next(error); }
});

router.post('/banners', async (req, res, next) => {
  try {
    const banner = await prisma.banner.create({ data: req.body });
    return ApiResponse.created(res, banner);
  } catch (error) { next(error); }
});

router.patch('/banners/:id', async (req, res, next) => {
  try {
    const banner = await prisma.banner.update({ where: { id: req.params.id }, data: req.body });
    return ApiResponse.success(res, banner);
  } catch (error) { next(error); }
});

router.delete('/banners/:id', async (req, res, next) => {
  try {
    await prisma.banner.delete({ where: { id: req.params.id } });
    return ApiResponse.success(res, null, 'Banner deleted');
  } catch (error) { next(error); }
});

export default router;
