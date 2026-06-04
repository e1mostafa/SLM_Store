'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, Truck, Tag, Check, Loader2, MapPin, Plus } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { usersApi, ordersApi, couponsApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';

const PAYMENT_METHODS = [
  { value: 'STRIPE', label: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard, American Express' },
  { value: 'PAYMOB', label: 'Paymob', icon: '🏦', desc: 'Egyptian payment gateway' },
  { value: 'COD', label: 'Cash on Delivery', icon: '💰', desc: 'Pay when you receive' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, subtotal, fetchCart } = useCartStore();
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('STRIPE');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<{ discount: number; code: string } | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    fetchCart();
  }, [isAuthenticated]);

  const { data: addressesData } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => usersApi.getAddresses().then(r => r.data.data),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (addressesData?.length > 0 && !selectedAddress) {
      const defaultAddr = addressesData.find((a: { isDefault: boolean }) => a.isDefault) || addressesData[0];
      setSelectedAddress(defaultAddr.id);
    }
  }, [addressesData]);

  const handleCouponApply = async () => {
    if (!couponCode.trim()) return;
    try {
      const { data } = await couponsApi.validate(couponCode, subtotal);
      setCouponData(data.data);
      toast.success(`Coupon applied! Saved EGP ${data.data.discount.toLocaleString()}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Invalid coupon');
    }
  };

  const discount = couponData?.discount || 0;
  const shipping = subtotal >= 5000 ? 0 : 50;
  const total = subtotal - discount + shipping;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    setIsPlacingOrder(true);
    try {
      const { data } = await ordersApi.create({
        addressId: selectedAddress,
        paymentMethod: paymentMethod as 'STRIPE' | 'PAYMOB' | 'COD',
        couponCode: couponData?.code,
      });

      toast.success('Order placed successfully!');
      router.push(`/orders/${data.data.id}?success=1`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0 && !isPlacingOrder) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl mb-4">🛒</p>
            <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
            <Link href="/products" className="text-amazon-orange hover:underline">Continue Shopping</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        <h1 className="text-2xl font-bold text-foreground mb-6">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          {[
            { n: 1, label: 'Address' },
            { n: 2, label: 'Payment' },
            { n: 3, label: 'Review' },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= n ? 'bg-amazon-orange text-white' : 'bg-muted text-muted-foreground'}`}>
                {step > n ? <Check className="w-4 h-4" /> : n}
              </div>
              <span className={`text-sm ${step >= n ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
              {n < 3 && <div className="w-12 h-px bg-border" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-6">
            {/* Step 1: Address */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-5">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amazon-orange" /> Delivery Address
                </h2>
                {addressesData?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-3">No saved addresses</p>
                    <Link href="/account/addresses" className="text-amazon-orange hover:underline text-sm">
                      + Add New Address
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addressesData?.map((addr: { id: string; fullName: string; street: string; city: string; state: string; country: string; phone: string; isDefault: boolean }) => (
                      <button
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${selectedAddress === addr.id ? 'border-amazon-orange bg-amazon-orange/5' : 'border-border hover:border-muted-foreground'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground text-sm">{addr.fullName}</p>
                            <p className="text-muted-foreground text-xs mt-0.5">{addr.street}, {addr.city}, {addr.state}, {addr.country}</p>
                            <p className="text-muted-foreground text-xs">{addr.phone}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {addr.isDefault && <span className="text-xs bg-amazon-orange/10 text-amazon-orange px-2 py-0.5 rounded-full">Default</span>}
                            {selectedAddress === addr.id && <Check className="w-4 h-4 text-amazon-orange" />}
                          </div>
                        </div>
                      </button>
                    ))}
                    <Link href="/account/addresses" className="flex items-center gap-2 text-sm text-amazon-orange hover:underline">
                      <Plus className="w-4 h-4" /> Add new address
                    </Link>
                  </div>
                )}
                <button onClick={() => setStep(2)} disabled={!selectedAddress} className="w-full mt-4 bg-amazon-orange hover:bg-amazon-orange-dark text-white font-semibold py-2.5 rounded-md transition-colors disabled:opacity-50">
                  Continue to Payment
                </button>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-5">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amazon-orange" /> Payment Method
                </h2>
                <div className="space-y-3 mb-4">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setPaymentMethod(m.value)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${paymentMethod === m.value ? 'border-amazon-orange bg-amazon-orange/5' : 'border-border hover:border-muted-foreground'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{m.icon}</span>
                        <div>
                          <p className="font-medium text-foreground text-sm">{m.label}</p>
                          <p className="text-muted-foreground text-xs">{m.desc}</p>
                        </div>
                        {paymentMethod === m.value && <Check className="w-4 h-4 text-amazon-orange ml-auto" />}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Coupon */}
                <div className="border border-border rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Promo Code
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="flex-1 px-3 py-2 border border-input rounded text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                    />
                    <button onClick={handleCouponApply} className="bg-amazon-orange hover:bg-amazon-orange-dark text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                      Apply
                    </button>
                  </div>
                  {couponData && (
                    <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
                      <Check className="w-4 h-4" />
                      Saved EGP {couponData.discount.toLocaleString()}!
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Try: WELCOME20 or SAVE500</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 border border-border text-foreground py-2.5 rounded-md text-sm hover:bg-muted transition-colors">
                    Back
                  </button>
                  <button onClick={() => setStep(3)} className="flex-1 bg-amazon-orange hover:bg-amazon-orange-dark text-white font-semibold py-2.5 rounded-md transition-colors">
                    Review Order
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-5">
                <h2 className="font-semibold text-foreground mb-4">Order Review</h2>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 bg-muted rounded flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        EGP {(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 border border-border text-foreground py-2.5 rounded-md text-sm hover:bg-muted transition-colors">
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="flex-1 bg-amazon-orange hover:bg-amazon-orange-dark text-white font-semibold py-2.5 rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    {isPlacingOrder && <Loader2 className="w-4 h-4 animate-spin" />}
                    Place Order
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-card border border-border rounded-lg p-5 sticky top-20">
              <h2 className="font-semibold text-foreground mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-foreground">
                  <span>Items ({items.length})</span>
                  <span>EGP {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>-EGP {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-foreground">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `EGP ${shipping}`}</span>
                </div>
              </div>
              <hr className="border-border my-3" />
              <div className="flex justify-between font-bold text-lg text-foreground">
                <span>Total</span>
                <span>EGP {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
