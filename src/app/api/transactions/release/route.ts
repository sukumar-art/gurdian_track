import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function POST(req: Request) {
  try {
    const { transactionId } = await req.json();

    if (!transactionId) {
      return NextResponse.json({ error: 'Missing transactionId parameter' }, { status: 400 });
    }

    // 1. Get the current authenticated user session
    const currentUser = await db.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized: No active session' }, { status: 401 });
    }

    // 2. Fetch the transaction details
    // In mock mode we can get all transactions and filter, or use db helper
    // In Supabase mode we can fetch the record. Let's find it.
    let transactionRecord: any = null;
    
    if (db.isMock) {
      // Access localStorage via mockEngine or query active bookings
      const txs = await db.getTransactions('', 'admin');
      transactionRecord = txs.find((t: any) => t.id === transactionId);
    } else {
      const { data, error } = await (db as any).supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();
      
      if (!error) transactionRecord = data;
    }

    if (!transactionRecord) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // 3. Security Verification: Only the startup who booked OR an admin can release the escrow funds
    const isOwnerStartup = transactionRecord.startup_id === currentUser.id;
    const isAdmin = currentUser.role === 'admin';

    if (!isOwnerStartup && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to release this escrow transaction' }, { status: 403 });
    }

    if (transactionRecord.status === 'released') {
      return NextResponse.json({ error: 'Transaction already released' }, { status: 400 });
    }

    // 4. Calculate Payout Deductions
    // Commission: 12%
    // Flat Escrow Fee: ₹99
    const dealAmount = Number(transactionRecord.amount);
    const commission = Math.round(dealAmount * 0.12);
    const escrowFee = 99;
    const netPayout = dealAmount - commission - escrowFee;

    // 5. Update Status in Database
    const res = await db.updateTransactionStatus(
      transactionId,
      'released',
      undefined,
      commission,
      escrowFee
    );

    if (res.success) {
      console.log(`[Escrow Payout] Released Tx ${transactionId}. Deal: ₹${dealAmount}, Comm: ₹${commission}, Fee: ₹${escrowFee}, Net: ₹${netPayout}`);
      return NextResponse.json({
        status: 'released',
        dealAmount,
        commission,
        escrowFee,
        netPayout,
        message: 'Escrow payment released successfully'
      });
    } else {
      return NextResponse.json({ error: res.error || 'Failed to update transaction status' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in escrow payout release:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
