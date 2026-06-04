import { prisma } from '../../database/client';
import { AppError } from '../../middleware/errorHandler';

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  seller?: string;
  sort?: string;
  page?: number;
  limit?: number;
  isFlashSale?: boolean;
  isFeatured?: boolean;
}

export class ProductsService {
  async findAll(filters: ProductFilters) {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      seller,
      sort = 'createdAt',
      page = 1,
      limit = 20,
      isFlashSale,
      isFeatured,
    } = filters;

    // FIX: Use plain object instead of Prisma.ProductWhereInput (unavailable in stub client)
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    if (category) {
      const cat = await prisma.category.findFirst({
        where: { OR: [{ slug: category }, { id: category }] },
      });
      if (cat) where.categoryId = cat.id;
    }

    if (minPrice !== undefined) where.price = { ...((where.price as object) || {}), gte: minPrice };
    if (maxPrice !== undefined) where.price = { ...((where.price as object) || {}), lte: maxPrice };
    if (rating) where.rating = { gte: rating };
    if (seller) where.sellerId = seller;
    if (isFlashSale !== undefined) where.isFlashSale = isFlashSale;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    // FIX: Use plain object for orderBy instead of Prisma type
    const orderBy: Record<string, string> = {};
    switch (sort) {
      case 'price_asc': orderBy.price = 'asc'; break;
      case 'price_desc': orderBy.price = 'desc'; break;
      case 'rating': orderBy.rating = 'desc'; break;
      case 'popular': orderBy.soldCount = 'desc'; break;
      case 'newest': orderBy.createdAt = 'desc'; break;
      default: orderBy.createdAt = 'desc';
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          seller: { select: { id: true, storeName: true, storeSlug: true, rating: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page, limit };
  }

  async findBySlug(slug: string, userId?: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        seller: {
          include: {
            user: { select: { name: true, avatar: true } },
          },
        },
        variants: true,
        reviews: {
          where: { isApproved: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, avatar: true } },
          },
        },
      },
    });

    if (!product) throw new AppError('Product not found', 404);

    // Track view
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    // Track recently viewed
    if (userId) {
      await prisma.recentlyViewed.upsert({
        where: { userId_productId: { userId, productId: product.id } },
        update: { viewedAt: new Date() },
        create: { userId, productId: product.id },
      });
    }

    // Related products
    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: 'ACTIVE',
      },
      take: 8,
      select: {
        id: true, name: true, slug: true, price: true, comparePrice: true,
        thumbnail: true, rating: true, reviewCount: true, isFlashSale: true, flashSalePrice: true,
      },
    });

    return { ...product, related };
  }

  // FIX: Removed the fragile spread + explicit sellerId pattern.
  // Now uses a plain data object to avoid type conflicts.
  async create(sellerId: string, data: Record<string, unknown>) {
    return prisma.product.create({
      data: {
        ...data,
        sellerId,
      } as never,
    });
  }

  async update(id: string, sellerId: string, data: Record<string, unknown>) {
    const product = await prisma.product.findFirst({ where: { id, sellerId } });
    if (!product) throw new AppError('Product not found', 404);
    return prisma.product.update({ where: { id }, data: data as never });
  }

  async delete(id: string, sellerId: string) {
    const product = await prisma.product.findFirst({ where: { id, sellerId } });
    if (!product) throw new AppError('Product not found', 404);
    await prisma.product.delete({ where: { id } });
  }

  async getFeatured() {
    return prisma.product.findMany({
      where: { isFeatured: true, status: 'ACTIVE' },
      take: 12,
      include: {
        seller: { select: { storeName: true } },
      },
    });
  }

  async getFlashSales() {
    return prisma.product.findMany({
      where: {
        isFlashSale: true,
        status: 'ACTIVE',
        flashSaleEndsAt: { gt: new Date() },
      },
      orderBy: { flashSaleEndsAt: 'asc' },
      include: {
        seller: { select: { storeName: true } },
      },
    });
  }

  async getRecentlyViewed(userId: string) {
    const viewed = await prisma.recentlyViewed.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take: 10,
      include: {
        product: {
          select: {
            id: true, name: true, slug: true, price: true, comparePrice: true,
            thumbnail: true, rating: true, reviewCount: true,
          },
        },
      },
    });
    // FIX: type the map callback explicitly
    return viewed.map((v: { product: unknown }) => v.product);
  }
}

export const productsService = new ProductsService();
