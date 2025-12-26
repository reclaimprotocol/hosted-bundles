'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

type VerificationStatus = 'waiting' | 'submitted' | 'error';

function StatusContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('submitted');

  useEffect(() => {
    // Listen for postMessage from iframe if verification completes
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'RECLAIM_VERIFICATION_SUCCESS') {
        setStatus('submitted');
      } else if (event.data?.type === 'RECLAIM_VERIFICATION_ERROR') {
        setStatus('error');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-10 text-center">
            <div className="mb-6 inline-flex items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-scaleIn">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Verification complete
            </h2>
            <p className="text-gray-500 text-sm">
              You can close this tab
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-600">Loading...</div>
        </div>
      }>
        <StatusContent />
      </Suspense>
    </div>
  );
}
