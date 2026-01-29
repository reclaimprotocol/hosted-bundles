import { NextRequest, NextResponse } from 'next/server';
import { getProcessor } from './processors';
import { verifyProof } from '@reclaimprotocol/js-sdk';
import { Wallet } from 'ethers';

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * Sign data using ECDSA with the app secret
 */
async function signData(data: any, appSecret: string): Promise<string> {
  try {
    // Create a wallet from the app secret (private key)
    const wallet = new Wallet(appSecret);

    // Stringify and hash the data
    const dataString = JSON.stringify(data);

    // Sign the data
    const signature = await wallet.signMessage(dataString);

    return signature;
  } catch (error) {
    console.error('Error signing data:', error);
    throw new Error('Failed to sign data');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Log the raw body for debugging
    const body = await request.json();
    console.log('Received Reclaim callback:', JSON.stringify(body, null, 2));
    await verifyProof(body);

    // Body is an array of proofs
    const proofs = Array.isArray(body) ? body : [body];

    if (!proofs || proofs.length === 0) {
      console.error('No proofs received in callback');
      return NextResponse.json({
        success: false,
        message: 'No proofs provided',
      }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get the first proof to extract context
    const firstProof = proofs[0];
    const contextData = firstProof.claimData?.context;

    // Parse the context
    let metadata: any = {};
    let extractedParameters: any = {};
    let bundleId = 'default';
    let callbackUrl = '';
    let applicationId = '';
    let sessionId = '';
    let incomingSignature = '';

    if (contextData) {
      try {
        const parsedContext = JSON.parse(contextData);
        console.log('Parsed context:', parsedContext);

        // Extract the contextMessage which contains our metadata
        if (parsedContext.contextMessage) {
          metadata = JSON.parse(parsedContext.contextMessage);
          console.log('Extracted metadata from contextMessage:', metadata);
        } else {
          console.log('No contextMessage found in parsed context');
        }

        // Extract the parameters that were verified
        extractedParameters = parsedContext.extractedParameters || {};
        console.log('Extracted parameters:', extractedParameters);
      } catch (e) {
        console.error('Failed to parse context:', e);
      }
    } else {
      console.log('No contextData found in proof');
    }

    // Use metadata from context
    bundleId = metadata.bundleId || 'default';
    callbackUrl = metadata.callbackUrl || '';
    applicationId = metadata.applicationId || '';
    sessionId = metadata.sessionId || '';
    incomingSignature = metadata.signature || '';
    const providerId = metadata.providerId;

    console.log('Final metadata:', { bundleId, callbackUrl, applicationId, sessionId, providerId });

    // Fetch provider details if providerId is available
    let institutionName = '';
    console.log('Provider ID for institution lookup:', providerId);

    if (providerId) {
      try {
        const providerUrl = `https://devapi.reclaimprotocol.org/api/provider-hunt/providers/${providerId}/?tag=university`;
        console.log('Fetching provider details from:', providerUrl);

        const providerResponse = await fetch(providerUrl);
        if (providerResponse.ok) {
          const providerData = await providerResponse.json();
          console.log('Provider API response:', JSON.stringify(providerData, null, 2));
          if (providerData.isSuccess && providerData.provider) {
            institutionName = providerData.provider.name;
            console.log('Fetched institution name:', institutionName);
          } else {
            console.log('Provider API did not return expected data structure');
          }
        } else {
          console.log('Provider API returned status:', providerResponse.status);
        }
      } catch (error) {
        console.error('Error fetching provider details:', error);
        // Continue without institution name
      }
    } else {
      console.log('No providerId found in metadata, skipping institution name fetch');
    }

    // Get the appropriate processor for this bundle
    const processor = getProcessor(bundleId);
    console.log(`Using processor for bundle: ${bundleId}`);

    // Process each proof with the bundle-specific processor
    const processedProofs = proofs.map((proof: any) => {
      // Get extractedParameters from this proof's context
      let proofExtractedParams = {};
      try {
        const proofContext = JSON.parse(proof.claimData?.context || '{}');
        proofExtractedParams = proofContext.extractedParameters || {};
      } catch (e) {
        console.error('Failed to parse proof context:', e);
      }

      // Pass extractedParameters to processor
      const processed = processor.process(proofExtractedParams);
      console.log('Processed proof:', JSON.stringify(processed, null, 2));
      return processed;
    });

    // Forward processed proof to external callback URL if provided
    if (callbackUrl) {
      try {
        console.log('Forwarding processed proof to external callback:', callbackUrl);

        // Prepare the data object
        const data = {
          sessionId,
          applicationId,
          bundleId,
          proofs: processedProofs,
          timestamp: new Date().toISOString(),
          institutionName: institutionName || undefined,
	  rawProofs: proofs
        };

        // Sign the data using the app secret
        const appSecret = process.env.RECLAIM_APP_SECRET;
        if (!appSecret) {
          throw new Error('RECLAIM_APP_SECRET not configured');
        }

        const signature = await signData(data, appSecret);
        console.log('Generated signature:', signature);

        // Send to external callback with data and signature
        const payload = {
          data,
          signature,
        };

        const forwardResponse = await fetch(callbackUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        console.log('Proof forwarded successfully, status:', forwardResponse.status);
      } catch (error) {
        console.error('Error forwarding proof to external callback:', error);
        // Don't fail the request if callback fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Proof received and processed',
      processed: processedProofs.length,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error processing Reclaim callback:', error);
    return NextResponse.json(
      { error: 'Failed to process callback', details: String(error) },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
