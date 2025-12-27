import { NextRequest, NextResponse } from 'next/server';
import { verifyMessage } from 'ethers';

/**
 * Helper endpoint to verify callback signatures
 * External developers can call this endpoint to verify that a callback came from the verification portal
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, signature } = body;

    // Validate required fields
    if (!data) {
      return NextResponse.json(
        {
          verified: false,
          score: 0,
          error: 'Missing required field: data'
        },
        { status: 400 }
      );
    }

    if (!signature) {
      return NextResponse.json(
        {
          verified: false,
          score: 0,
          error: 'Missing required field: signature'
        },
        { status: 400 }
      );
    }

    // Get the app secret to derive the expected signer address
    const appSecret = process.env.RECLAIM_APP_SECRET;

    if (!appSecret) {
      console.error('RECLAIM_APP_SECRET not configured');
      return NextResponse.json(
        {
          verified: false,
          score: 0,
          error: 'Server configuration error: RECLAIM_APP_SECRET not set'
        },
        { status: 500 }
      );
    }

    try {
      // Import Wallet only when needed to avoid issues
      const { Wallet } = await import('ethers');

      // Derive the expected signer address from the app secret
      const wallet = new Wallet(appSecret);
      const expectedSigner = wallet.address;

      // Stringify the data for verification
      const dataString = JSON.stringify(data);

      // Recover the address from the signature
      const recoveredAddress = verifyMessage(dataString, signature);

      // Verify that the recovered address matches the expected signer
      const isValid = recoveredAddress.toLowerCase() === expectedSigner.toLowerCase();

      if (isValid) {
        return NextResponse.json({
          verified: true,
          score: 100,
          message: 'Signature verified successfully',
          signer: recoveredAddress,
        });
      } else {
        return NextResponse.json({
          verified: false,
          score: 0,
          message: 'Invalid signature',
          details: {
            expectedSigner,
            recoveredSigner: recoveredAddress,
          }
        });
      }

    } catch (error) {
      console.error('Error verifying signature:', error);
      return NextResponse.json(
        {
          verified: false,
          score: 0,
          error: 'Failed to verify signature',
          details: String(error)
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing verification request:', error);
    return NextResponse.json(
      {
        verified: false,
        score: 0,
        error: 'Failed to process request',
        details: String(error)
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
