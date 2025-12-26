import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { verifySignature, createSignatureMessage } from '@/lib/signature';

// This endpoint integrates with Reclaim Protocol JS SDK
// All metadata is passed to Reclaim and will be returned in the callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, bundleId, sessionId, providerId, signature, callbackUrl } = body;

    // Validate required fields
    if (!applicationId || !bundleId || !sessionId || !providerId || !signature || !callbackUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, bundleId, sessionId, providerId, signature, callbackUrl' },
        { status: 400 }
      );
    }

    // Verify the signature
    const signatureData = { applicationId, bundleId, callbackUrl, sessionId };
    const isValid = verifySignature(signatureData, signature, applicationId);

    if (!isValid) {
      const exampleCode = `// Install ethers.js first:
// npm install ethers

import { Wallet } from 'ethers';

/**
 * Generate a signed verification URL
 * @param {string} applicationSecret - Your application secret from .env
 * @param {string} bundleId - The bundle ID (e.g., 'education')
 * @param {string} callbackUrl - Your callback URL to receive verification results
 * @param {string} sessionId - Unique session identifier
 * @param {string} providerId - (Optional) The provider ID for verification
 * @returns {Promise<string>} The signed verification URL
 */
async function getSignedVerificationUrl(
  applicationSecret,
  bundleId,
  callbackUrl,
  sessionId,
  providerId
) {
  // Create wallet from your application secret
  const wallet = new Wallet(applicationSecret);
  const applicationId = wallet.address;

  // The data to sign (keys must be sorted alphabetically)
  const data = {
    applicationId,
    bundleId,
    callbackUrl,
    sessionId
  };

  // Create the message (keys sorted alphabetically)
  const sortedKeys = Object.keys(data).sort();
  const message = sortedKeys.map(key => \`\${key}:\${data[key]}\`).join('|');

  // Sign the message
  const signature = await wallet.signMessage(message);

  // Build the verification URL
  const params = new URLSearchParams({
    applicationId,
    bundleId,
    sessionId,
    providerId,
    callbackUrl,
    signature
  });

  return \`${request.nextUrl.origin}/verify/process?\${params.toString()}\`;
}

// Usage example:
const verificationUrl = await getSignedVerificationUrl(
  process.env.APPLICATION_SECRET, // Your application secret from .env
  '${bundleId}',                  // Bundle ID
  '${callbackUrl}',               // Your callback URL
  '${sessionId}',                 // Session ID
  ${providerId ? `'${providerId}'` : `''`}                        // Optional: Your provider ID
);

console.log('Verification URL:', verificationUrl);

// For more information, visit: https://docs.reclaimprotocol.org/hosted-bundles
`;

      return NextResponse.json(
        {
          error: 'Invalid signature',
          message: 'The signature does not match the applicationId. The signature must be created by signing the request data with the application secret.',
          details: {
            expectedSigner: applicationId,
            signedData: signatureData,
          },
          example: exampleCode,
          docs: 'https://docs.reclaimprotocol.org/hosted-bundles',
        },
        { status: 401 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const proofRequestOptions = {
        useAppClip: false,
        customSharePageUrl: 'https://portal.reclaimprotocol.org/kernel',
        
    }

    const reclaimProofRequest = await ReclaimProofRequest.init(
      process.env.RECLAIM_APP_ID,
      process.env.RECLAIM_APP_SECRET,
      providerId,
      proofRequestOptions
    );

    reclaimProofRequest.setAppCallbackUrl(`${baseUrl}/api/reclaim-callback`, true);
    reclaimProofRequest.setContext(sessionId, JSON.stringify({ applicationId, bundleId, sessionId, providerId, signature, callbackUrl }) );
    reclaimProofRequest.setRedirectUrl(`${baseUrl}/verify/status?` + new URLSearchParams({
      sessionId,
      applicationId,
      bundleId,
      callbackUrl,
      signature,
    }).toString());

    const requestUrl = await reclaimProofRequest.getRequestUrl();

    const reclaimProofRequestFallback = await ReclaimProofRequest.init(
      process.env.RECLAIM_APP_ID,
      process.env.RECLAIM_APP_SECRET,
      providerId
    );

    reclaimProofRequestFallback.setAppCallbackUrl(`${baseUrl}/api/reclaim-callback`, true);
    reclaimProofRequestFallback.setContext(sessionId, JSON.stringify({ applicationId, bundleId, sessionId, providerId, signature, callbackUrl }) );
    reclaimProofRequestFallback.setRedirectUrl(`${baseUrl}/verify/status?` + new URLSearchParams({
      sessionId,
      applicationId,
      bundleId,
      callbackUrl,
      signature,
    }).toString());

    return NextResponse.json({
      url: requestUrl,
      fallback : await reclaimProofRequestFallback.toJsonString(),
      sessionId,
    });
  } catch (error) {
    console.error('Error generating verification URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate verification URL' },
      { status: 500 }
    );
  }
}
