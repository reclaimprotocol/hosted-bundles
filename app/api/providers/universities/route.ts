import { NextRequest, NextResponse } from 'next/server';
import universities from '@/data/universities.json';

const API_BASE_URL = 'https://api.providerhunt.xyz/api/bundle/verification-type/';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';

  // Require at least 3 characters to search
  if (query.length < 3) {
    return NextResponse.json({
      results: [],
      message: 'Please enter at least 3 characters to search',
      minCharacters: 3,
    });
  }

  // Search local universities
  const localResults = universities.filter((university) =>
    university.providerName.toLowerCase().includes(query.toLowerCase())
  );

  // Search remote API
  let remoteResults: any[] = [];
  try {
    const apiUrl = `${API_BASE_URL}?verificationType=university&page=1&limit=20&search=${encodeURIComponent(query)}`;
    const response = await fetch(apiUrl);

    if (response.ok) {
      const data = await response.json();

      if (data.isSuccess) {
        // Transform the API response to match the expected format
        remoteResults = data.data.bundles[0]?.providers.map((provider: any) => ({
          providerId: provider.httpProviderId,
          providerName: provider.name,
          logoUrl: provider.logoUrl,
          alias: provider.alias,
          description: provider.description,
        })) || [];
      }
    }
  } catch (error) {
    console.error('Error fetching universities from remote API:', error);
    // Continue with local results only
  }

  // Combine and deduplicate results based on providerId
  const combinedResults = [...localResults];
  const existingIds = new Set(localResults.map(r => r.providerId));

  for (const remoteResult of remoteResults) {
    if (!existingIds.has(remoteResult.providerId)) {
      combinedResults.push(remoteResult);
      existingIds.add(remoteResult.providerId);
    }
  }

  return NextResponse.json({
    results: combinedResults,
    query,
    count: combinedResults.length,
    sources: {
      local: localResults.length,
      remote: remoteResults.length,
      total: combinedResults.length,
    },
  });
}
