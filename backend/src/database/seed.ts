import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@slmstore.com' },
    update: {},
    create: {
      email: 'admin@slmstore.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create Seller
  const sellerPassword = await bcrypt.hash('Seller@123', 12);
  const sellerUser = await prisma.user.upsert({
    where: { email: 'seller@slmstore.com' },
    update: {},
    create: {
      email: 'seller@slmstore.com',
      name: 'TechStore Egypt',
      password: sellerPassword,
      role: 'SELLER',
      isEmailVerified: true,
    },
  });

  const seller = await prisma.seller.upsert({
    where: { userId: sellerUser.id },
    update: {},
    create: {
      userId: sellerUser.id,
      storeName: 'TechStore Egypt',
      storeSlug: 'techstore-egypt',
      description: 'Your #1 source for premium electronics in Egypt',
      status: 'APPROVED',
      rating: 4.8,
      commissionRate: 8,
    },
  });
  console.log('✅ Seller created:', sellerUser.email);

  // Create Customer
  const customerPassword = await bcrypt.hash('Customer@123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@slmstore.com' },
    update: {},
    create: {
      email: 'customer@slmstore.com',
      name: 'Ahmed Hassan',
      password: customerPassword,
      role: 'CUSTOMER',
      isEmailVerified: true,
    },
  });
  console.log('✅ Customer created:', customer.email);

  // Create Categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      nameAr: 'إلكترونيات',
      slug: 'electronics',
      description: 'Latest gadgets and electronics',
      icon: '💻',
      sortOrder: 1,
    },
  });

  const fashion = await prisma.category.upsert({
    where: { slug: 'fashion' },
    update: {},
    create: {
      name: 'Fashion',
      nameAr: 'أزياء',
      slug: 'fashion',
      description: 'Clothing, shoes and accessories',
      icon: '👗',
      sortOrder: 2,
    },
  });

  const home = await prisma.category.upsert({
    where: { slug: 'home-living' },
    update: {},
    create: {
      name: 'Home & Living',
      nameAr: 'المنزل والمعيشة',
      slug: 'home-living',
      description: 'Furniture and home decor',
      icon: '🏠',
      sortOrder: 3,
    },
  });

  const sports = await prisma.category.upsert({
    where: { slug: 'sports' },
    update: {},
    create: {
      name: 'Sports & Outdoors',
      nameAr: 'الرياضة والخارج',
      slug: 'sports',
      description: 'Sports equipment and outdoor gear',
      icon: '⚽',
      sortOrder: 4,
    },
  });

  const beauty = await prisma.category.upsert({
    where: { slug: 'beauty' },
    update: {},
    create: {
      name: 'Beauty & Health',
      nameAr: 'الجمال والصحة',
      slug: 'beauty',
      description: 'Skincare, makeup and health products',
      icon: '💄',
      sortOrder: 5,
    },
  });
  console.log('✅ Categories created');

  // Create Products
  const products = [
    {
      name: 'Apple MacBook Pro 16" M3 Pro',
      slug: 'apple-macbook-pro-16-m3-pro',
      description: 'The most powerful MacBook Pro ever. With M3 Pro chip, up to 22 hours battery life, Liquid Retina XDR display, and stunning performance for professionals.',
      price: 79999,
      comparePrice: 89999,
      stock: 15,
      categoryId: electronics.id,
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
      ],
      thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      rating: 4.9,
      reviewCount: 127,
      isFeatured: true,
      tags: ['laptop', 'apple', 'macbook', 'pro', 'm3'],
    },
    {
      name: 'iPhone 15 Pro Max 256GB',
      slug: 'iphone-15-pro-max-256gb',
      description: 'The ultimate iPhone. Titanium design, A17 Pro chip, Pro camera system with 5x Telephoto, and Action button. Experience the next level of iPhone.',
      price: 59999,
      comparePrice: 64999,
      stock: 30,
      categoryId: electronics.id,
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
      ],
      thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
      rating: 4.8,
      reviewCount: 342,
      isFeatured: true,
      isFlashSale: true,
      flashSalePrice: 54999,
      tags: ['iphone', 'apple', 'smartphone', '5g'],
    },
    {
      name: 'Sony WH-1000XM5 Headphones',
      slug: 'sony-wh-1000xm5-headphones',
      description: 'Industry-leading noise canceling with Dual Noise Sensor technology. Up to 30-hour battery life. Exceptional call quality with Auto NC Optimizer.',
      price: 12999,
      comparePrice: 15999,
      stock: 45,
      categoryId: electronics.id,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
      ],
      thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      rating: 4.7,
      reviewCount: 89,
      isFeatured: true,
      tags: ['headphones', 'sony', 'noise-canceling', 'wireless'],
    },
    {
      name: 'Samsung 4K QLED Smart TV 65"',
      slug: 'samsung-4k-qled-smart-tv-65',
      description: 'Quantum Dot technology for brilliant colors. Neural Quantum Processor 4K. Object Tracking Sound. Smart TV with built-in Alexa and Google Assistant.',
      price: 45999,
      comparePrice: 55999,
      stock: 8,
      categoryId: electronics.id,
      images: [
        'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800',
      ],
      thumbnail: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400',
      rating: 4.6,
      reviewCount: 56,
      tags: ['tv', 'samsung', '4k', 'smart-tv', 'qled'],
    },
    {
      name: 'Nike Air Max 2024 Running Shoes',
      slug: 'nike-air-max-2024-running-shoes',
      description: 'Next-gen cushioning meets sleek design. Full-length Air unit for lightweight, springy comfort. Engineered mesh upper for breathability.',
      price: 4999,
      comparePrice: 6500,
      stock: 60,
      categoryId: sports.id,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
      ],
      thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      rating: 4.5,
      reviewCount: 203,
      isFlashSale: true,
      flashSalePrice: 3999,
      tags: ['shoes', 'nike', 'running', 'sports'],
    },
    {
      name: 'DJI Mini 4 Pro Drone',
      slug: 'dji-mini-4-pro-drone',
      description: '4K/60fps camera, 3-axis gimbal stabilization, omnidirectional obstacle sensing, 34-min flight time. Perfect for aerial photography enthusiasts.',
      price: 35999,
      comparePrice: 39999,
      stock: 12,
      categoryId: electronics.id,
      images: [
        'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800',
      ],
      thumbnail: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=400',
      rating: 4.8,
      reviewCount: 34,
      isFeatured: true,
      tags: ['drone', 'dji', 'camera', 'aerial'],
    },
    {
      name: 'Levi\'s 501 Original Jeans',
      slug: 'levis-501-original-jeans',
      description: 'The original jean since 1873. Straight fit with iconic button fly. Made with quality denim for lasting comfort and style.',
      price: 2499,
      comparePrice: 3200,
      stock: 100,
      categoryId: fashion.id,
      images: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
      ],
      thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      rating: 4.4,
      reviewCount: 445,
      tags: ['jeans', 'levis', 'fashion', 'denim'],
    },
    {
      name: 'Dyson V15 Detect Vacuum',
      slug: 'dyson-v15-detect-vacuum',
      description: 'Laser Detect technology reveals invisible dust. HEPA filtration captures allergens. 60-min runtime. Powerful suction for deep cleaning.',
      price: 19999,
      comparePrice: 24999,
      stock: 20,
      categoryId: home.id,
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      ],
      thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      rating: 4.7,
      reviewCount: 78,
      isFeatured: true,
      tags: ['dyson', 'vacuum', 'home', 'cleaning'],
    },
  ];

  for (const productData of products) {
    const { flashSalePrice, ...rest } = productData;
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: {
        ...rest,
        price: rest.price,
        comparePrice: rest.comparePrice,
        flashSalePrice: flashSalePrice || null,
        flashSaleEndsAt: productData.isFlashSale ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
        sellerId: seller.id,
        status: 'ACTIVE',
        soldCount: Math.floor(Math.random() * 200),
        sku: `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      },
    });
  }
  console.log('✅ Products created');

  // Create Coupons
  await prisma.coupon.upsert({
    where: { code: 'WELCOME20' },
    update: {},
    create: {
      code: 'WELCOME20',
      description: '20% off for new customers',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 500,
      maxDiscount: 2000,
      usageLimit: 1000,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'SAVE500' },
    update: {},
    create: {
      code: 'SAVE500',
      description: 'EGP 500 off on orders above EGP 5000',
      discountType: 'fixed',
      discountValue: 500,
      minOrderAmount: 5000,
      isActive: true,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Coupons created');

  // Create Banners
  const banners = [
    {
      title: 'Flash Sale - Up to 70% Off',
      titleAr: 'تخفيضات حتى 70%',
      subtitle: 'Limited time offer on top electronics',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
      link: '/flash-sale',
      sortOrder: 1,
    },
    {
      title: 'New Collection 2024',
      titleAr: 'مجموعة 2024 الجديدة',
      subtitle: 'Explore the latest fashion trends',
      image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200',
      link: '/categories/fashion',
      sortOrder: 2,
    },
  ];

  for (const banner of banners) {
    await prisma.banner.create({ data: banner }).catch(() => {});
  }
  console.log('✅ Banners created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('👤 Admin: admin@slmstore.com / Admin@123');
  console.log('🏪 Seller: seller@slmstore.com / Seller@123');
  console.log('👤 Customer: customer@slmstore.com / Customer@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
