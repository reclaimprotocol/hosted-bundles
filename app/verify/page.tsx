'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';
import ProviderSelector from '@/components/ProviderSelector';

function VerifyContent() {
  const searchParams = useSearchParams();
  const [signatureError, setSignatureError] = useState(false);
  const [signatureErrorDetails, setSignatureErrorDetails] = useState<any>(null);
  const [validating, setValidating] = useState(true);

  const params = {
    applicationId: searchParams.get('applicationId') || '',
    bundleId: searchParams.get('bundleId') || '',
    callbackUrl: searchParams.get('callbackUrl') || '',
    sessionId: searchParams.get('sessionId') || '',
    providerId: searchParams.get('providerId') || undefined,
    signature: searchParams.get('signature') || '',
  };

  useEffect(() => {
    async function validateSignature() {
      // If providerId is already set, redirect to process page
      if (params.providerId) {
        const queryParams = new URLSearchParams({
          applicationId: params.applicationId,
          bundleId: params.bundleId,
          callbackUrl: params.callbackUrl,
          sessionId: params.sessionId,
          providerId: params.providerId,
          signature: params.signature,
        });
        window.location.href = `/verify/process?${queryParams.toString()}`;
        return;
      }

      // Skip validation if missing required fields
      if (!params.applicationId || !params.bundleId || !params.callbackUrl || !params.sessionId || !params.signature) {
        setValidating(false);
        return;
      }

      try {
        // Call API to validate signature
        const response = await fetch('/api/generate-verification-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...params,
            providerId: 'temp-validation-only',
          }),
        });

        const data = await response.json();

        if (data.error === 'Invalid signature') {
          // Replace temp providerId with actual value from params for display
          if (data.example) {
            data.example = data.example.replace(/'temp-validation-only'/g, `''`);
          }
          setSignatureError(true);
          setSignatureErrorDetails(data);
        }
      } catch (err) {
        console.error('Error validating signature:', err);
      } finally {
        setValidating(false);
      }
    }

    validateSignature();
  }, []);

  // Show signature error
  if (signatureError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar applicationId={params.applicationId} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8 max-w-4xl w-full">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Invalid Signature
              </h2>
              <p className="text-gray-600 text-sm mb-2">
                {signatureErrorDetails?.message || 'The verification request signature is invalid or does not match the application ID.'}
              </p>
            </div>

            {signatureErrorDetails?.details && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-red-900 mb-2">Details</h3>
                <p className="text-xs font-mono text-red-800 break-all mb-1">
                  Expected Signer: {signatureErrorDetails.details.expectedSigner}
                </p>
                <p className="text-xs text-red-700">
                  Signed Data: {JSON.stringify(signatureErrorDetails.details.signedData)}
                </p>
              </div>
            )}

            {signatureErrorDetails?.example && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">How to Fix: Generate a Valid Signature</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs text-green-400 font-mono whitespace-pre">
                    {signatureErrorDetails.example}
                  </pre>
                </div>
              </div>
            )}

            <div className="text-center space-y-2">
              {signatureErrorDetails?.docs && (
                <p className="text-sm">
                  <a
                    href={signatureErrorDetails.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline inline-flex items-center gap-1"
                  >
                    View Documentation
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </p>
              )}
              <p className="text-xs text-gray-400">
                If you believe this is an error, please contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while validating
  if (validating) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar applicationId={params.applicationId} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-gray-600">Validating signature...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar applicationId={params.applicationId} />
      <ProviderSelector params={params} />
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
