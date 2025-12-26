import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('===== DUMMY CALLBACK RECEIVED =====');
    console.log(JSON.stringify(body, null, 2));
    console.log('===================================');

    return NextResponse.json({
      success: true,
      message: 'Callback received and logged',
      receivedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in dummy callback:', error);
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}
