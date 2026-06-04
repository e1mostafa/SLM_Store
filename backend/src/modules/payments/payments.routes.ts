import { Router } from 'express';
import Stripe from 'stripe';
import { authenticate } from '../../middleware/auth';
import { prisma } from '../../database/client';
import { ApiResponse } from '../../common/response.util';
import { AppError } from '../../middleware/errorHandler';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });

const router = Router();

// Create Stripe payment intent
router.post('/stripe/create-intent', authenticate, async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id },
    });
    if (!order) throw new AppError('Order not found', 404);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.total) * 100), // in cents
      currency: 'egp',
      metadata: { orderId, userId: req.user!.id },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentIntentId: paymentIntent.id },
    });

    return ApiResponse.success(res, { clientSecret: paymentIntent.client_secret });
  } catch (error) { next(error); }
});

// Stripe webhook
router.post('/stripe/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch {
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata.orderId;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
      },
    });
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata.orderId;

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'FAILED' },
    });
  }

  res.json({ received: true });
});

// Paymob payment initiation
router.post('/paymob/initiate', authenticate, async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id },
      include: { user: true },
    });
    if (!order) throw new AppError('Order not found', 404);

    // Step 1: Get Paymob auth token
    const authResponse = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY }),
    });
    const authData = await authResponse.json() as { token: string };
    const authToken = authData.token;

    // Step 2: Create order
    const paymobOrderResponse = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: Math.round(Number(order.total) * 100),
        currency: 'EGP',
        merchant_order_id: order.id,
      }),
    });
    const paymobOrder = await paymobOrderResponse.json() as { id: string };

    // Step 3: Get payment key
    const paymentKeyResponse = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: Math.round(Number(order.total) * 100),
        expiration: 3600,
        order_id: paymobOrder.id,
        billing_data: {
          first_name: order.user.name.split(' ')[0],
          last_name: order.user.name.split(' ')[1] || 'N/A',
          email: order.user.email,
          phone_number: order.user.phone || '01000000000',
          apartment: 'N/A',
          floor: 'N/A',
          street: 'N/A',
          building: 'N/A',
          city: 'Cairo',
          country: 'EG',
          state: 'Cairo',
          postal_code: '11511',
        },
        currency: 'EGP',
        integration_id: process.env.PAYMOB_INTEGRATION_ID,
      }),
    });
    const paymentKeyData = await paymentKeyResponse.json() as { token: string };

    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKeyData.token}`;

    return ApiResponse.success(res, { iframeUrl, paymentToken: paymentKeyData.token });
  } catch (error) { next(error); }
});

// Paymob callback
router.post('/paymob/callback', async (req, res) => {
  try {
    const { obj } = req.body;
    if (obj?.success && obj?.merchant_order_id) {
      await prisma.order.update({
        where: { id: obj.merchant_order_id },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
      });
    }
    res.json({ success: true });
  } catch {
    res.json({ success: false });
  }
});

// Mark COD order as confirmed
router.post('/cod/confirm', authenticate, async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id, paymentMethod: 'COD' },
    });
    if (!order) throw new AppError('Order not found', 404);

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    });

    return ApiResponse.success(res, null, 'Order confirmed for cash on delivery');
  } catch (error) { next(error); }
});

export default router;
