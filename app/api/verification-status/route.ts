import { NextRequest, NextResponse } from 'next/server';

// This endpoint is now stateless - status is determined by checking with Reclaim Protocol
// or can be polled from the client side using postMessage from iframe

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  // In a stateless architecture, the client (iframe) will communicate status
  // via postMessage or the status will be determined by the redirect from Reclaim
  // This endpoint can be used to verify with Reclaim Protocol directly if needed

  // For now, return waiting - the actual status will be managed client-side
  return NextResponse.json({
    status: 'waiting',
    sessionId,
    message: 'Status is managed client-side via redirect from Reclaim Protocol'
  });
}
