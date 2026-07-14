import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

const isRazorpayConfigured = keyId !== '' && keySecret !== '';

// Initialize Razorpay SDK if keys are set
const razorpay = isRazorpayConfigured
  ? new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
  : null;

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: 'Invalid amount provided' }, { status: 400 });
    }

    if (isRazorpayConfigured && razorpay) {
      // Razorpay expects amount in paise (1 INR = 100 paise)
      const options = {
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: `receipt_escrow_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      return NextResponse.json({ orderId: order.id, status: 'created' });
    } else {
      // Mock Fallback Mode
      console.log(`[Razorpay Mock] Creating mock order for amount: ₹${amount}`);
      const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 11)}`;
      return NextResponse.json({ orderId: mockOrderId, status: 'mock_created' });
    }
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
