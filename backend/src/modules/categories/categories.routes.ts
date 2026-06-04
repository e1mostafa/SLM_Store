import { Router } from 'express';
import { prisma } from '../../database/client';
import { ApiResponse } from '../../common/response.util';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: { where: { isActive: true } },
        _count: { select: { products: { where: { status: 'ACTIVE' } } } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return ApiResponse.success(res, categories);
  } catch (error) { next(error); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        children: { where: { isActive: true } },
        parent: true,
      },
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    return ApiResponse.success(res, category);
  } catch (error) { next(error); }
});

export default router;
