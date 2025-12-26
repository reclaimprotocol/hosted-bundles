'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VerificationParams, Provider } from '@/types';
import DefaultBundle from './bundles/DefaultBundle';
import EducationBundle from './bundles/EducationBundle';

interface ProviderSelectorProps {
  params: VerificationParams;
}

export default function ProviderSelector({ params }: ProviderSelectorProps) {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProviders() {
      try {
        const response = await fetch(`/api/providers?bundleId=${params.bundleId}`);
        const data = await response.json();
        setProviders(data.providers || []);
      } catch (error) {
        console.error('Error loading providers:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProviders();
  }, [params.bundleId]);

  const handleProviderSelect = (providerId: string) => {
    const url = new URLSearchParams({
      applicationId: params.applicationId,
      bundleId: params.bundleId,
      callbackUrl: params.callbackUrl,
      sessionId: params.sessionId,
      providerId,
      signature: params.signature,
    });
    router.push(`/verify/process?${url.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-gray-600">Loading providers...</div>
      </div>
    );
  }

  // Render different UI based on bundleId
  switch (params.bundleId) {
    case 'education':
      return <EducationBundle providers={providers} onSelect={handleProviderSelect} />;
    default:
      return <DefaultBundle providers={providers} onSelect={handleProviderSelect} />;
  }
}
