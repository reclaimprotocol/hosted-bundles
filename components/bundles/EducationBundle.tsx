'use client';

import { useState, useEffect } from 'react';
import { Provider } from '@/types';

interface BundleProps {
  providers?: Provider[];
  onSelect: (providerId: string) => void;
}

interface University {
  providerId: string;
  providerName: string;
  logoUrl?: string;
}

export default function EducationBundle({ onSelect }: BundleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function searchUniversities() {
      if (searchQuery.length < 3) {
        setUniversities([]);
        setMessage('');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/providers/universities?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();

        if (data.results) {
          setUniversities(data.results);
          setMessage('');
        } else if (data.message) {
          setMessage(data.message);
          setUniversities([]);
        }
      } catch (error) {
        console.error('Error searching universities:', error);
        setMessage('Error searching universities');
        setUniversities([]);
      } finally {
        setLoading(false);
      }
    }

    const debounceTimer = setTimeout(searchUniversities, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 text-center border-b border-gray-100">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl mb-3 sm:mb-4 shadow-lg shadow-indigo-500/30">
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Student Verification
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Search and select your university to verify your student status
            </p>
          </div>

          {/* Search Bar */}
          <div className="px-4 sm:px-8 pt-4 sm:pt-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Type at least 3 characters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm sm:text-base text-gray-900 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery.length > 0 && searchQuery.length < 3 && (
              <p className="mt-2 text-xs sm:text-sm text-indigo-600">
                Type {3 - searchQuery.length} more character{3 - searchQuery.length !== 1 ? 's' : ''} to start searching...
              </p>
            )}
          </div>

          {/* University List */}
          <div className="px-4 sm:px-8 py-4 sm:py-6">
            <div className="min-h-[250px] sm:min-h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center py-10 sm:py-12">
                  <div className="text-center">
                    <svg
                      className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-indigo-600 mx-auto mb-2 sm:mb-3"
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
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <p className="text-gray-600 text-xs sm:text-sm">Searching...</p>
                  </div>
                </div>
              ) : searchQuery.length < 3 ? (
                <div className="text-center py-10 sm:py-12">
                  <svg
                    className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Start searching</p>
                  <p className="text-gray-400 text-xs">Enter at least 3 characters to find your university</p>
                </div>
              ) : universities.length > 0 ? (
                <div className="max-h-80 sm:max-h-96 overflow-y-auto space-y-2 pr-1 sm:pr-2 scrollbar-thin">
                  {universities.map((university, index) => (
                    <button
                      key={university.providerId}
                      onClick={() => onSelect(university.providerId)}
                      className="group w-full text-left px-3 sm:px-5 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-200 transform hover:scale-[1.01] hover:shadow-md"
                      style={{
                        animationDelay: `${index * 30}ms`,
                        animation: 'fadeIn 0.4s ease-out forwards',
                        opacity: 0,
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:from-indigo-100 group-hover:to-blue-200 transition-colors flex-shrink-0 overflow-hidden">
                            {university.logoUrl ? (
                              <img
                                src={university.logoUrl}
                                alt={university.providerName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <svg
                              className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-indigo-600 ${university.logoUrl ? 'hidden' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-indigo-900 transition-colors truncate">
                              {university.providerName}
                            </div>
                          </div>
                        </div>
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-indigo-600 transition-all group-hover:translate-x-1 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 sm:py-12">
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">No universities found</p>
                  <p className="text-gray-400 text-xs">Try a different search term for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-8 pb-4 sm:pb-6 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs">Secure student verification</span>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 sm:mt-6 text-center px-4">
          <p className="text-xs sm:text-sm text-gray-600">
            Don't see your university?{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
              Contact support
            </a>
          </p>
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

        /* Custom scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
