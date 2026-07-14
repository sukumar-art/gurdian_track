import { NextResponse } from 'next/server';
import crypto from 'crypto';

const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
const isRazorpayConfigured = process.env.RAZORPAY_KEY_ID !== '' && keySecret !== '';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    if (isRazorpayConfigured) {
      // Create HMAC SHA256 signature hash
      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generated_signature = crypto
        .createHmac('sha256', keySecret)
        .update(text)
        .digest('hex');

      if (generated_signature === razorpay_signature) {
        return NextResponse.json({ status: 'verified', message: 'Payment verified successfully' });
      } else {
        return NextResponse.json({ status: 'failed', error: 'Payment verification signature mismatch' }, { status: 400 });
      }
    } else {
      // Mock Fallback Mode
      console.log(`[Razorpay Mock] Verifying mock payment: ${razorpay_payment_id}`);
      return NextResponse.json({ status: 'verified', message: 'Mock payment verified successfully' });
    }
  } catch (error: any) {
    console.error('Error verifying Razorpay signature:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
