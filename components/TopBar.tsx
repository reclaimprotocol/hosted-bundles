'use client';

import { useEffect, useState } from 'react';

interface TopBarProps {
  applicationId?: string;
  fallback?: string | null;
  hideTestingBanner?: boolean;
  sessionId?: string;
}

interface ApplicationInfo {
  name: string;
  appImageUrl: string;
  appImageExists: boolean;
  plan: string | null;
}

export default function TopBar({ applicationId, fallback, hideTestingBanner, sessionId }: TopBarProps) {
  const [appInfo, setAppInfo] = useState<ApplicationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSafetyDropdown, setShowSafetyDropdown] = useState(false);

  const handleContinueOnApp = async () => {
    if (!fallback) {
      console.error('No fallback data available');
      return;
    }

    try {
      const { ReclaimProofRequest } = await import('@reclaimprotocol/js-sdk');
      const reclaimProofRequest = await ReclaimProofRequest.fromJsonString(fallback);
      await reclaimProofRequest.triggerReclaimFlow();
    } catch (error) {
      console.error('Error triggering Reclaim flow:', error);
      alert('Failed to open Reclaim app. Please try again.');
    }
  };

  useEffect(() => {
    async function fetchApplicationInfo() {
      if (!applicationId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.reclaimprotocol.org/api/applications/info/${applicationId}`,
          {
            headers: {
              'Accept': '*/*',
              'Origin': window.location.origin,
            },
          }
        );

        const data = await response.json();

        if (data.isSuccess && data.application) {
          setAppInfo({
            name: data.application.name,
            appImageUrl: data.application.appImageUrl,
            appImageExists: data.application.appImageExists,
            plan: data.application.plan || null,
          });
        }
      } catch (error) {
        console.error('Error fetching application info:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchApplicationInfo();
  }, [applicationId]);

  const shouldShowTestingBanner = !hideTestingBanner && !loading && (!appInfo || !appInfo.plan);

  return (
    <div className="w-full bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 shadow-sm relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
              <div className="space-y-2 min-w-0">
                <div className="h-4 sm:h-5 w-24 sm:w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-32 sm:w-48 bg-gray-100 rounded animate-pulse hidden sm:block"></div>
              </div>
            </div>
          ) : shouldShowTestingBanner ? (
            <div className="flex items-center justify-center">
              <div
                className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 cursor-help"
                title="You must upgrade to enterprise plan for this functionality."
              >
                <span className="text-xs sm:text-sm font-medium text-yellow-800">
                  For testing purposes only
                </span>
              </div>
            </div>
          ) : appInfo ? (
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Application Image or Icon */}
            {appInfo.appImageExists && appInfo.appImageUrl ? (
              <img
                src={appInfo.appImageUrl}
                alt={appInfo.name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            )}

            {/* Application Name and Subtext */}
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight truncate">
                {appInfo.name}
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Verification powered by{' '}
                <span className="font-medium text-gray-600">Reclaim Protocol</span>
                {sessionId && (
                  <>
                    {' '}&bull;{' '}
                    <span className="font-mono text-gray-400">Session: {sessionId}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          ) : (
            // Fallback when no applicationId provided
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Verification powered by{' '}
                  <span className="font-semibold text-gray-900">Reclaim Protocol</span>
                </span>
              </div>
              {sessionId && (
                <span className="text-xs font-mono text-gray-400 ml-7">Session: {sessionId}</span>
              )}
            </div>
          )}
        </div>

        {/* Is this Safe? Button */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowSafetyDropdown(!showSafetyDropdown)}
            className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 sm:gap-2"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="hidden sm:inline">Is this Safe?</span>
            <span className="sm:hidden">Safe?</span>
          </button>

          {/* Safety Dropdown */}
          {showSafetyDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSafetyDropdown(false)}
              />

              {/* Dropdown Content */}
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-[480px] max-w-[480px] bg-white rounded-xl shadow-2xl border border-gray-200 z-20 overflow-hidden max-h-[calc(100vh-6rem)] overflow-y-auto">
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Header */}
                  <div className="pb-4 border-b border-gray-100">
                    <p className="text-sm text-gray-600">
                      This verification is brought to you by{' '}
                      <span className="font-semibold text-gray-900">Reclaim Protocol</span>.
                    </p>
                    <a
                      href="https://docs.reclaimprotocol.org/audits"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      View Reclaim Protocol Audits →
                    </a>
                  </div>

                  {/* Certifications Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Certifications</h3>
                    <div className="flex gap-2 sm:gap-4">
                      <a
                        href="mailto:admin@reclaimprotocol.org?subject=Requesting Compliance Certificate SOC2"
                        className="flex-1 border border-gray-200 rounded-lg p-2 sm:p-3 hover:border-blue-300 hover:bg-blue-50 transition-all text-center"
                      >
                        <div className="text-xs font-semibold text-gray-700">SOC 2</div>
                      </a>
                      <a
                        href="mailto:admin@reclaimprotocol.org?subject=Requesting Compliance Certificate HIPAA"
                        className="flex-1 border border-gray-200 rounded-lg p-2 sm:p-3 hover:border-blue-300 hover:bg-blue-50 transition-all text-center"
                      >
                        <div className="text-xs font-semibold text-gray-700">HIPAA</div>
                      </a>
                      <a
                        href="mailto:admin@reclaimprotocol.org?subject=Requesting Compliance Certificate GDPR"
                        className="flex-1 border border-gray-200 rounded-lg p-2 sm:p-3 hover:border-blue-300 hover:bg-blue-50 transition-all text-center"
                      >
                        <div className="text-xs font-semibold text-gray-700">GDPR</div>
                      </a>
                    </div>
                  </div>

                  {/* Verification Modes Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Verification Modes</h3>

                    {/* Cloud Mode */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900">Cloud</h4>
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded">Current</span>
                          </div>
                          <p className="text-xs text-gray-700">
                            You are browsing using a secure remote browser powered by{' '}
                            <a href="https://usekernel.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                              Kernel
                            </a>
                            .
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Mode */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900">Mobile</h4>
                            <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-medium rounded">Most Secure</span>
                          </div>
                          <p className="text-xs text-gray-700 mb-3">
                            If you don't want to use a remote browser, you can complete this process on your mobile phone from the Reclaim Protocol app.
                          </p>
                          <button
                            onClick={handleContinueOnApp}
                            disabled={!fallback}
                            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Continue on App
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
