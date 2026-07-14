import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '../../../../lib/db';

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
const isWebhookSecretConfigured = webhookSecret !== '';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (isWebhookSecretConfigured) {
      if (!signature) {
        return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
      }

      // Verify Razorpay Webhook Signature
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('[Webhook Error] Signature verification failed.');
        return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
      }
    } else {
      console.log('[Webhook Warning] Webhook secret not configured. Skipping signature validation for testing.');
    }

    // Parse payload
    const eventData = JSON.parse(rawBody);
    const event = eventData.event;
    console.log(`[Webhook Event Received] ${event}`);

    // Reconcile payment events
    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = eventData.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || eventData.payload?.order?.entity?.id;
      const paymentId = paymentEntity?.id || `pay_web_${Date.now()}`;

      if (!orderId) {
        return NextResponse.json({ error: 'No order ID found in webhook payload' }, { status: 400 });
      }

      // Find transaction associated with this order ID
      const tx = await db.getTransactionByOrderId(orderId);
      if (!tx) {
        console.warn(`[Webhook Warning] No transaction found for order ID: ${orderId}`);
        // Return 200 to prevent Razorpay from repeatedly retrying this webhook
        return NextResponse.json({ status: 'ignored', message: 'Transaction not found for this order' });
      }

      // Update status to 'pending' (representing locked in escrow, waiting for delivery)
      const updateRes = await db.updateTransactionStatus(tx.id, 'pending', paymentId);
      if (updateRes.success) {
        console.log(`[Webhook Success] Reconciled payment for order ${orderId}. Tx ${tx.id} updated to pending (escrow hold).`);
        return NextResponse.json({ status: 'reconciled', transactionId: tx.id });
      } else {
        console.error(`[Webhook Error] Failed to update transaction: ${updateRes.error}`);
        return NextResponse.json({ error: updateRes.error }, { status: 500 });
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = eventData.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;

      if (orderId) {
        const tx = await db.getTransactionByOrderId(orderId);
        if (tx) {
          // Update status to 'failed' (or we can delete it, or keep it as pending/failed)
          // For simplicity we can update status to a failed state or handle it
          console.log(`[Webhook Alert] Payment failed for order ${orderId}. Tx ${tx.id} status remains pending/failed.`);
        }
      }
    }

    // Return 200 OK to verify we received the webhook successfully
    return NextResponse.json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('Error handling Razorpay webhook:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
