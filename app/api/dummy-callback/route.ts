import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('===== DUMMY CALLBACK RECEIVED =====');
    console.log(JSON.stringify(body, null, 2));
    console.log('===================================');

    // Example: Verify the callback signature using the helper endpoint
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    try {
      const verifyResponse = await fetch(`${baseUrl}/api/helper/verify-callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const verifyResult = await verifyResponse.json();
      console.log('===== SIGNATURE VERIFICATION =====');
      console.log(JSON.stringify(verifyResult, null, 2));
      console.log('===================================');

      if (verifyResult.verified) {
        console.log('✅ Signature verified! Score:', verifyResult.score);
      } else {
        console.log('❌ Signature verification failed!');
      }
    } catch (error) {
      console.error('Error verifying signature:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Callback received and logged',
      receivedAt: new Date().toISOString(),
      note: 'Check server logs for signature verification result',
    });
  } catch (error) {
    console.error('Error in dummy callback:', error);
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}
