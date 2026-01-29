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
    if (!applicationId || !bundleId || !sessionId || !signature || !callbackUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, bundleId, sessionId, signature, callbackUrl' },
        { status: 400 }
      );
    }

    // For default bundle, providerId is required
    if (bundleId === 'default' && !providerId) {
      return NextResponse.json(
        {
          error: 'Missing required field: providerId',
          message: 'When using bundleId "default", you must provide a providerId. The default bundle requires a specific provider to be selected.'
        },
        { status: 400 }
      );
    }

    // Verify the signature
    const signatureData = { applicationId, bundleId, callbackUrl, sessionId };
    const isValid = verifySignature(signatureData, signature, applicationId);

    if (!isValid) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
      const exampleCode = `// Use the helper endpoint to generate a signed URL

// Using curl:
curl -X POST ${baseUrl}/api/helper/generate-signed-url \\
  -H "Content-Type: application/json" \\
  -d '{
    "applicationSecret": "YOUR_APPLICATION_SECRET",
    "bundleId": "${bundleId}",
    "callbackUrl": "${callbackUrl}",
    "sessionId": "${sessionId}"${providerId ? `,\n    "providerId": "${providerId}"` : ''}
  }'

// Using JavaScript/Node.js:
const response = await fetch('${baseUrl}/api/helper/generate-signed-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    applicationSecret: process.env.APPLICATION_SECRET,
    bundleId: '${bundleId}',
    callbackUrl: '${callbackUrl}',
    sessionId: '${sessionId}'${providerId ? `,\n    providerId: '${providerId}'` : ''}
  })
});

const data = await response.json();
console.log('Verification URL:', data.url);

// Response:
// {
//   "success": true,
//   "url": "https://your-app.com/verify?...",
//   "applicationId": "0x...",
//   "signature": "0x..."
// }

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
          helper: `${baseUrl}/api/helper/generate-signed-url`,
          docs: 'https://docs.reclaimprotocol.org/hosted-bundles',
        },
        { status: 401 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

    // Validate environment variables
    const reclaimAppId = process.env.RECLAIM_APP_ID;
    const reclaimAppSecret = process.env.RECLAIM_APP_SECRET;

    if (!reclaimAppId || !reclaimAppSecret) {
      console.error('Missing environment variables:', {
        RECLAIM_APP_ID: reclaimAppId ? 'set' : 'MISSING',
        RECLAIM_APP_SECRET: reclaimAppSecret ? 'set' : 'MISSING',
      });
      return NextResponse.json(
        {
          error: 'Server configuration error',
          message: 'RECLAIM_APP_ID or RECLAIM_APP_SECRET is not configured. Please set these environment variables in your deployment settings.',
          details: {
            RECLAIM_APP_ID: reclaimAppId ? 'configured' : 'missing',
            RECLAIM_APP_SECRET: reclaimAppSecret ? 'configured' : 'missing',
          }
        },
        { status: 500 }
      );
    }

    const proofRequestOptions = {
        useAppClip: false,
        customSharePageUrl: 'https://portal.reclaimprotocol.org/kernel',

    }

    const reclaimProofRequest = await ReclaimProofRequest.init(
      reclaimAppId,
      reclaimAppSecret,
      providerId,
      proofRequestOptions
    );

    reclaimProofRequest.setAppCallbackUrl(`${baseUrl}/api/reclaim-callback`, true);
    reclaimProofRequest.setContext(sessionId, JSON.stringify({ applicationId, bundleId, sessionId, providerId, signature, callbackUrl, reclaimSessionId : reclaimProofRequest.sessionId }) );
    reclaimProofRequest.setRedirectUrl(`${baseUrl}/verify/status?` + new URLSearchParams({
      sessionId,
      applicationId,
      bundleId,
      callbackUrl,
      signature,
    }).toString());

    const requestUrl = await reclaimProofRequest.getRequestUrl();
    console.log(await reclaimProofRequest.toJsonString())

    const reclaimProofRequestFallback = await ReclaimProofRequest.init(
      reclaimAppId,
      reclaimAppSecret,
      providerId
    );

    reclaimProofRequestFallback.setAppCallbackUrl(`${baseUrl}/api/reclaim-callback`, true);
    reclaimProofRequestFallback.setContext(sessionId, JSON.stringify({ applicationId, bundleId, sessionId, providerId, signature, callbackUrl, reclaimSessionId: reclaimProofRequestFallback.sessionId }) );
    reclaimProofRequestFallback.setRedirectUrl(`${baseUrl}/verify/status?` + new URLSearchParams({
      sessionId,
      applicationId,
      bundleId,
      callbackUrl,
      signature,
    }).toString());

    console.log("request fallback", await reclaimProofRequestFallback.toJsonString());

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
