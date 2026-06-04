import { prisma } from '../../database/client';
import { AppError } from '../../middleware/errorHandler';

// FIX: PaymentMethod is not exported from @prisma/client when using stub client.
// Define our own type matching the schema enum.
export type PaymentMethod = 'STRIPE' | 'PAYMOB' | 'COD';

export interface CreateOrderDto {
  addressId: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
}

export class OrdersService {
  async create(userId: string, dto: CreateOrderDto) {
    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { seller: true },
        },
      },
    });

    if (cartItems.length === 0) throw new AppError('Cart is empty', 400);

    // Check stock
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${item.product.name}`, 400);
      }
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of cartItems) {
      const price = item.product.isFlashSale && item.product.flashSalePrice
        ? Number(item.product.flashSalePrice)
        : Number(item.product.price);
      subtotal += price * item.quantity;
    }

    let discount = 0;
    let couponId: string | undefined;

    // Apply coupon
    if (dto.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: dto.couponCode.toUpperCase(),
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      });

      if (!coupon) throw new AppError('Invalid or expired coupon', 400);
      if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
        throw new AppError(`Minimum order amount is ${coupon.minOrderAmount}`, 400);
      }

      if (coupon.discountType === 'percentage') {
        discount = (subtotal * Number(coupon.discountValue)) / 100;
        if (coupon.maxDiscount) {
          discount = Math.min(discount, Number(coupon.maxDiscount));
        }
      } else {
        discount = Number(coupon.discountValue);
      }

      couponId = coupon.id;
    }

    const shipping = subtotal > 5000 ? 0 : 50;
    const tax = 0;
    const total = subtotal - discount + shipping + tax;

    // Generate order number
    const orderNumber = `AMZ-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // FIX: Transaction callback typed as (tx: typeof prisma) instead of any
    const order = await prisma.$transaction(async (tx: any) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: dto.addressId,
          paymentMethod: dto.paymentMethod,
          subtotal,
          discount,
          shipping,
          tax,
          total,
          couponId,
          notes: dto.notes,
          items: {
            // FIX: typed the map callback item explicitly
            create: cartItems.map((item: typeof cartItems[number]) => {
              const price = item.product.isFlashSale && item.product.flashSalePrice
                ? Number(item.product.flashSalePrice)
                : Number(item.product.price);
              return {
                productId: item.productId,
                sellerId: item.product.sellerId,
                name: item.product.name,
                image: item.product.thumbnail,
                price,
                quantity: item.quantity,
                subtotal: price * item.quantity,
              };
            }),
          },
        },
        include: { items: true },
      });

      // Update stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }

      // Update coupon usage
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { userId } });

      return newOrder;
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        title: 'Order Placed Successfully',
        message: `Your order #${orderNumber} has been placed and is being processed.`,
        type: 'order',
        link: `/orders/${order.id}`,
      },
    });

    return order;
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          items: {
            include: {
              product: {
                select: { slug: true, thumbnail: true },
              },
            },
          },
          address: true,
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);
    return { orders, total, page, limit };
  }

  async findById(id: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            product: { select: { slug: true, thumbnail: true } },
            seller: { select: { storeName: true } },
          },
        },
        address: true,
      },
    });
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  async cancel(id: string, userId: string) {
    const order = await prisma.order.findFirst({ where: { id, userId } });
    if (!order) throw new AppError('Order not found', 404);
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new AppError('Order cannot be cancelled', 400);
    }

    return prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
  }

  // Admin/Seller methods
  async updateStatus(id: string, status: string) {
    return prisma.order.update({
      where: { id },
      data: { status: status as never },
    });
  }

  async getAll(page = 1, limit = 20, status?: string) {
    const where = status ? { status: status as never } : {};
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { name: true, quantity: true, price: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);
    return { orders, total, page, limit };
  }
}

export const ordersService = new OrdersService();
