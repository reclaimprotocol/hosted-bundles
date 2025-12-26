'use client';

import { useState } from 'react';
import { Wallet } from 'ethers';

export default function DummyWebsitePage() {
  const [loading, setLoading] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState('');
  const [formData, setFormData] = useState({
    bundleId: 'education',
    callbackUrl: 'http://localhost:3000/api/dummy-callback',
    providerId: 'ff4d7afe-4b78-4795-9429-d20df2deaad7',
  });

  const generateVerificationUrl = async () => {
    setLoading(true);
    try {
      // Generate a random private key for demo purposes
      const wallet = Wallet.createRandom();
      const applicationId = wallet.address;
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Create the signature message
      const signatureData = {
        applicationId,
        bundleId: formData.bundleId,
        callbackUrl: formData.callbackUrl,
        sessionId,
      };

      // Sort keys and create message
      const sortedKeys = Object.keys(signatureData).sort();
      const message = sortedKeys.map(key => `${key}:${signatureData[key as keyof typeof signatureData]}`).join('|');

      // Sign the message
      const signature = await wallet.signMessage(message);

      // Build the verification URL
      const params = new URLSearchParams({
        applicationId,
        bundleId: formData.bundleId,
        callbackUrl: formData.callbackUrl,
        sessionId,
        providerId: formData.providerId,
        signature,
      });

      const url = `${window.location.origin}/verify?${params.toString()}`;
      setVerificationUrl(url);

      console.log('Generated verification request:');
      console.log('- Application ID:', applicationId);
      console.log('- Session ID:', sessionId);
      console.log('- Signature:', signature);
      console.log('- Private Key (for demo):', wallet.privateKey);
    } catch (error) {
      console.error('Error generating URL:', error);
      alert('Failed to generate verification URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Verification Portal Demo
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Test the verification flow by generating a signed request
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Configure Verification Request
            </h2>
          </div>

          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* Bundle ID */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Bundle ID
              </label>
              <select
                value={formData.bundleId}
                onChange={(e) => setFormData({ ...formData, bundleId: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm sm:text-base"
              >
                <option value="education">Education</option>
                <option value="default">Default</option>
              </select>
            </div>

            {/* Callback URL */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Callback URL
              </label>
              <input
                type="text"
                value={formData.callbackUrl}
                onChange={(e) => setFormData({ ...formData, callbackUrl: e.target.value })}
                placeholder="https://your-app.com/api/callback"
                className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm sm:text-base"
              />
            </div>

            {/* Provider ID */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Provider ID (optional - for education bundle, search after)
              </label>
              <input
                type="text"
                value={formData.providerId}
                onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                placeholder="provider-id-here"
                className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm sm:text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to show provider selection page
              </p>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateVerificationUrl}
              disabled={loading}
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm sm:text-base font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Verification URL'}
            </button>
          </div>
        </div>

        {/* Generated URL Section */}
        {verificationUrl && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Verification URL Generated
              </h2>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* URL Display */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Generated URL
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 sm:p-3 break-all text-xs sm:text-sm font-mono text-gray-700">
                  {verificationUrl}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <a
                  href={verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white text-sm sm:text-base font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Start Verification →
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(verificationUrl);
                    alert('URL copied to clipboard!');
                  }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm sm:text-base font-semibold rounded-xl transition-all"
                >
                  Copy URL
                </button>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs sm:text-sm text-blue-800">
                    <p className="font-semibold mb-1">How it works:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>A random wallet is generated with a unique applicationId (Ethereum address)</li>
                      <li>The request is signed using ECDSA with the wallet's private key</li>
                      <li>The signature is verified against the applicationId before processing</li>
                      <li>After verification, the proof is sent to your callback URL</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documentation */}
        <div className="mt-6 sm:mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
            Integration Guide
          </h3>
          <div className="space-y-2 text-xs sm:text-sm text-gray-600">
            <p><strong>1. Generate Request:</strong> Create a signed verification request with your application ID</p>
            <p><strong>2. Redirect User:</strong> Send the user to the generated URL</p>
            <p><strong>3. User Verifies:</strong> User selects provider and completes verification</p>
            <p><strong>4. Receive Callback:</strong> Get the verified proof at your callback URL</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
