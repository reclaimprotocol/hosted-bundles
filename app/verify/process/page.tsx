'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';

function ProcessWrapper() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('applicationId') || '';
  const [fallback, setFallback] = useState<string | null>(null);
  const [reclaimSessionId, setReclaimSessionId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <TopBar applicationId={applicationId} fallback={fallback} sessionId={reclaimSessionId || undefined} hideTestingBanner={true} />
      <ProcessContentWrapper onFallbackReady={setFallback} onSessionIdReady={setReclaimSessionId} />
    </div>
  );
}

function ProcessContentWrapper({ onFallbackReady, onSessionIdReady }: { onFallbackReady: (fallback: string) => void; onSessionIdReady: (sessionId: string) => void }) {
  const searchParams = useSearchParams();
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signatureError, setSignatureError] = useState(false);
  const [signatureErrorDetails, setSignatureErrorDetails] = useState<any>(null);

  const params = {
    applicationId: searchParams.get('applicationId') || '',
    bundleId: searchParams.get('bundleId') || '',
    callbackUrl: searchParams.get('callbackUrl') || '',
    sessionId: searchParams.get('sessionId') || '',
    providerId: searchParams.get('providerId') || '',
    signature: searchParams.get('signature') || '',
  };

  useEffect(() => {
    async function verifyAndGenerateUrl() {
      try {
        // Call the API to generate verification URL (signature verification happens server-side)
        const response = await fetch('/api/generate-verification-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });

        const data = await response.json();
        console.log('API Response:', data);
        console.log('Response status:', response.status);

        if (data.url) {
          setVerificationUrl(data.url);
          if (data.fallback) {
            onFallbackReady(data.fallback);
          }
          if (data.main) {
            try {
              const mainData = JSON.parse(data.main);
              if (mainData.sessionId) {
                onSessionIdReady(mainData.sessionId);
              }
            } catch (e) {
              console.error('Error parsing main data:', e);
            }
          }
        } else if (data.error === 'Invalid signature') {
          console.log('Setting signature error with details:', data);
          setSignatureError(true);
          setSignatureErrorDetails(data);
        } else {
          console.log('Setting generic error:', data.error);
          setError(data.error || 'Failed to generate verification URL');
        }
      } catch (err) {
        setError('Error generating verification URL');
        console.error(err);
      }
    }

    verifyAndGenerateUrl();
  }, []);

  // Signature error page
  if (signatureError) {
    return (
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
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!verificationUrl) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6">
            <svg
              className="animate-spin w-20 h-20 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying request</h2>
          <p className="text-gray-600 text-sm">Validating signature and preparing verification...</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={verificationUrl}
      className="w-full h-[calc(100vh-64px)] border-0"
      title="Verification"
      allow="camera; microphone"
    />
  );
}

export default function ProcessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <TopBar hideTestingBanner={true} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    }>
      <ProcessWrapper />
    </Suspense>
  );
}
