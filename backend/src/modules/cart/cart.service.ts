import { prisma } from '../../database/client';
import { AppError } from '../../middleware/errorHandler';

export class CartService {
  async getCart(userId: string) {
    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true, name: true, slug: true, price: true, comparePrice: true,
            thumbnail: true, stock: true, isFlashSale: true, flashSalePrice: true,
            flashSaleEndsAt: true, status: true,
            seller: { select: { storeName: true } },
          },
        },
      },
    });

    const subtotal = items.reduce((acc: number, item: typeof items[number]) => {
      const price = item.product.isFlashSale && item.product.flashSalePrice
        ? Number(item.product.flashSalePrice)
        : Number(item.product.price);
      return acc + price * item.quantity;
    }, 0);

    return { items, subtotal, itemCount: items.length };
  }

  async addItem(userId: string, productId: string, quantity: number, variantId?: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== 'ACTIVE') throw new AppError('Product not available', 400);
    if (product.stock < quantity) throw new AppError('Insufficient stock', 400);

    // FIX: The @@unique([userId, productId, variantId]) constraint in Postgres treats
    // NULL as distinct, so two rows with variantId=NULL are NOT considered duplicates.
    // We normalize variantId to null (not '') consistently to work around this.
    const normalizedVariantId = variantId || null;

    const existing = await prisma.cartItem.findFirst({
      where: { userId, productId, variantId: normalizedVariantId },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    }

    return prisma.cartItem.create({
      data: { userId, productId, quantity, variantId: normalizedVariantId },
    });
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const item = await prisma.cartItem.findFirst({ where: { id: itemId, userId } });
    if (!item) throw new AppError('Cart item not found', 404);

    if (quantity <= 0) {
      return this.removeItem(userId, itemId);
    }

    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async removeItem(userId: string, itemId: string) {
    const item = await prisma.cartItem.findFirst({ where: { id: itemId, userId } });
    if (!item) throw new AppError('Cart item not found', 404);
    return prisma.cartItem.delete({ where: { id: itemId } });
  }

  async clearCart(userId: string) {
    return prisma.cartItem.deleteMany({ where: { userId } });
  }
}

export const cartService = new CartService();
