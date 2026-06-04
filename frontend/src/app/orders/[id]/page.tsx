'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Truck, Check, Clock, MapPin, CreditCard, ArrowLeft, CheckCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ordersApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/lib/utils';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  CONFIRMED: { label: 'Confirmed', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  PROCESSING: { label: 'Processing', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  SHIPPED: { label: 'Shipped', color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  DELIVERED: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  REFUNDED: { label: 'Refunded', color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-900/20' },
} as const;

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const isSuccess = searchParams.get('success') === '1';

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', params.id],
    queryFn: () => ordersApi.getOne(params.id as string).then(r => r.data.data),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) { router.push('/auth/login'); return null; }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full space-y-4">
          <div className="skeleton h-8 w-64" /><div className="skeleton h-48 w-full rounded-lg" /><div className="skeleton h-64 w-full rounded-lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col"><Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center"><p className="text-6xl mb-4">📦</p><h2 className="text-xl font-bold mb-2">Order not found</h2>
            <Link href="/orders" className="text-amazon-orange hover:underline">View all orders</Link></div>
        </div><Footer /></div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = ['CANCELLED', 'REFUNDED'].includes(order.status);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        {isSuccess && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div><p className="font-semibold text-green-800 dark:text-green-200">Order placed successfully! 🎉</p>
              <p className="text-sm text-green-600 dark:text-green-300">Thank you for your order. You will receive a confirmation soon.</p></div>
          </motion.div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-md transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Order Details</h1>
            <p className="text-muted-foreground text-sm">#{order.orderNumber}</p>
          </div>
          <div className={`ml-auto px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.color} ${statusConfig.bg}`}>{statusConfig.label}</div>
        </div>

        <div className="grid md:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            {!isCancelled && (
              <div className="bg-card border border-border rounded-lg p-5">
                <h2 className="font-semibold text-foreground mb-5">Order Progress</h2>
                <div className="relative">
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-border">
                    <div className="h-full bg-amazon-orange transition-all duration-500" style={{ width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1))) * 100}%` }} />
                  </div>
                  <div className="relative flex justify-between">
                    {STATUS_STEPS.map((step, i) => {
                      const isPast = i <= currentStep;
                      const isCurrent = i === currentStep;
                      const icons = [Clock, Check, Package, Truck, CheckCircle];
                      const Icon = icons[i];
                      const labels = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
                      return (
                        <div key={step} className="flex flex-col items-center gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all ${isPast ? 'bg-amazon-orange border-amazon-orange text-white' : 'bg-background border-border text-muted-foreground'} ${isCurrent ? 'ring-4 ring-amazon-orange/20' : ''}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-xs font-medium hidden sm:block ${isPast ? 'text-foreground' : 'text-muted-foreground'}`}>{labels[i]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Order Items ({order.items?.length})</h2>
              </div>
              <div className="divide-y divide-border">
                {order.items?.map((item: { id: string; name: string; image?: string; price: number; quantity: number; subtotal: number; product?: { slug: string }; seller?: { storeName: string } }) => (
                  <div key={item.id} className="flex gap-4 p-4">
                    <div className="relative w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                      {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-muted-foreground" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2">{item.name}</p>
                      {item.seller && <p className="text-xs text-muted-foreground mt-0.5">by {item.seller.storeName}</p>}
                      <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity} × EGP {Number(item.price).toLocaleString()}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-foreground">EGP {Number(item.subtotal).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amazon-orange" /> Delivery Address
              </h2>
              {order.address && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">{order.address.fullName}</p>
                  <p>{order.address.street}</p>
                  <p>{order.address.city}, {order.address.state}, {order.address.country}</p>
                  <p>{order.address.phone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-5">
              <h2 className="font-semibold text-foreground mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-foreground"><span>Order Date</span><span>{formatDate(order.createdAt)}</span></div>
                <div className="flex justify-between text-foreground"><span>Payment</span><span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" />{order.paymentMethod}</span></div>
                <hr className="border-border my-3" />
                <div className="flex justify-between"><span>Subtotal</span><span>EGP {Number(order.subtotal).toLocaleString()}</span></div>
                {Number(order.discount) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-EGP {Number(order.discount).toLocaleString()}</span></div>}
                <div className="flex justify-between"><span>Shipping</span><span className={Number(order.shipping) === 0 ? 'text-green-600' : ''}>{Number(order.shipping) === 0 ? 'FREE' : `EGP ${Number(order.shipping).toLocaleString()}`}</span></div>
                <hr className="border-border my-2" />
                <div className="flex justify-between font-bold text-base text-foreground"><span>Total</span><span>EGP {Number(order.total).toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span>Payment Status</span><span className={order.paymentStatus === 'PAID' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>{order.paymentStatus}</span></div>
              </div>
            </div>
            <Link href="/orders" className="flex items-center justify-center gap-2 text-sm text-amazon-orange hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to Orders
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
