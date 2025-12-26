import { NextRequest, NextResponse } from 'next/server';
import { BundleConfig } from '@/types';

// Mock data - replace with actual database queries
const BUNDLE_CONFIGS: Record<string, BundleConfig> = {
  'default': {
    id: 'default',
    name: 'Default Bundle',
    providers: [
      { id: 'email-verification', name: 'Email Verification', bundleId: 'default' },
      { id: 'phone-verification', name: 'Phone Verification', bundleId: 'default' },
    ],
  },
  'education': {
    id: 'education',
    name: 'Education Bundle',
    providers: [], // Universities are loaded via search API
  },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bundleId = searchParams.get('bundleId') || 'default';

  const bundle = BUNDLE_CONFIGS[bundleId] || BUNDLE_CONFIGS['default'];

  return NextResponse.json({
    providers: bundle.providers,
    bundleId: bundle.id,
  });
}
