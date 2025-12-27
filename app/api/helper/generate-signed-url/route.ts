import { NextRequest, NextResponse } from 'next/server';
import { Wallet } from 'ethers';

/**
 * Helper endpoint to generate a signed verification URL
 * This is useful for developers to test and generate signed URLs without implementing the signing logic
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationSecret, bundleId, callbackUrl, sessionId, providerId } = body;

    // Validate required fields
    if (!applicationSecret) {
      return NextResponse.json(
        { error: 'Missing required field: applicationSecret' },
        { status: 400 }
      );
    }

    if (!bundleId) {
      return NextResponse.json(
        { error: 'Missing required field: bundleId' },
        { status: 400 }
      );
    }

    if (!callbackUrl) {
      return NextResponse.json(
        { error: 'Missing required field: callbackUrl' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required field: sessionId' },
        { status: 400 }
      );
    }

    // Create wallet from application secret
    let wallet: Wallet;
    try {
      wallet = new Wallet(applicationSecret);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid applicationSecret. Must be a valid Ethereum private key.' },
        { status: 400 }
      );
    }

    const applicationId = wallet.address;

    // Create the data to sign (keys sorted alphabetically)
    const signatureData = {
      applicationId,
      bundleId,
      callbackUrl,
      sessionId,
    };

    // Create the message (keys sorted alphabetically)
    const sortedKeys = Object.keys(signatureData).sort();
    const message = sortedKeys.map(key => `${key}:${signatureData[key as keyof typeof signatureData]}`).join('|');

    // Sign the message
    const signature = await wallet.signMessage(message);

    // Build the verification URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const params = new URLSearchParams({
      applicationId,
      bundleId,
      callbackUrl,
      sessionId,
      signature,
    });

    // Add providerId if provided
    if (providerId) {
      params.append('providerId', providerId);
    }

    const verificationUrl = `${baseUrl}/verify?${params.toString()}`;

    return NextResponse.json({
      success: true,
      url: verificationUrl,
      applicationId,
      signature,
      message: 'Signed verification URL generated successfully',
    });

  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate signed URL', details: String(error) },
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
