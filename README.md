# Verification Portal

A Next.js application that provides verification services powered by Reclaim Protocol, similar to SheerID and Persona.

## Features

- **Fully Stateless**: No database or session storage required - all metadata passed via URL parameters
- **Multi-Bundle Support**: Different UIs for different verification bundles
- **Provider Selection**: Users can choose from various verification providers
- **Reclaim Protocol Integration**: Embedded iframe verification flow
- **Status Tracking**: Real-time verification status via URL parameters and postMessage
- **Callback Forwarding**: Automatically forwards proofs to external callback URLs

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

4. Update the environment variables:
   - `NEXT_PUBLIC_BASE_URL`: Your application URL
   - `RECLAIM_APP_ID`: Your Reclaim Protocol App ID
   - `RECLAIM_APP_SECRET`: Your Reclaim Protocol App Secret

### Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### URL Parameters

External websites should redirect users to:

```
/verify?applicationId={app_id}&bundleId={bundle_id}&callbackUrl={callback_url}&sessionId={session_id}&signature={signature}&providerId={provider_id}
```

**Required Parameters:**
- `applicationId`: Your application identifier
- `bundleId`: The bundle/theme to use (e.g., `miami-university`, `default`)
- `callbackUrl`: URL to receive the verification proof
- `sessionId`: Unique session identifier
- `signature`: Request signature for security

**Optional Parameters:**
- `providerId`: Pre-select a specific verification provider

### Flow

1. User is redirected to `/verify` with URL parameters
2. User sees bundle-specific UI and selects a provider
3. User is redirected to `/verify/process` where iframe loads Reclaim Protocol
4. After verification, user is redirected to `/verify/status?sessionId={id}&applicationId={id}&bundleId={id}&callbackUrl={url}&signature={sig}&status=success`
5. Status page shows completion based on URL parameters
6. Proof is automatically forwarded to the external callback URL by Reclaim Protocol

### Stateless Architecture

This application is **completely stateless**:

- **No database**: All data flows through URL parameters
- **No session storage**: Metadata is passed between pages via query strings
- **No server-side state**: Each API call is independent

**How it works:**

1. Initial URL contains all metadata (applicationId, bundleId, callbackUrl, sessionId, signature)
2. Provider selection page passes metadata to verification page
3. Verification URL generation embeds metadata in Reclaim SDK context
4. Reclaim Protocol returns metadata in callback
5. Redirect URL includes all metadata as query parameters
6. Status page receives metadata from URL parameters

### Adding New Bundles

1. Create a new bundle component in `components/bundles/`
2. Add bundle configuration to `app/api/providers/route.ts`
3. Update the switch statement in `components/ProviderSelector.tsx`

### API Endpoints

- `GET /api/providers?bundleId={id}` - Get providers for a bundle (stateless)
- `POST /api/generate-verification-url` - Generate Reclaim Protocol verification URL (stateless - passes metadata to SDK)
- `GET /api/verification-status?sessionId={id}` - Optional status check endpoint (stateless)
- `POST /api/reclaim-callback` - Receive proof from Reclaim Protocol and forward to external callback (stateless)

## Production Deployment

### Important Notes

1. **Stateless Design**:
   - No database required
   - No Redis/cache needed
   - Can scale horizontally without session affinity
   - Each request is completely independent

2. **Integrate Reclaim Protocol SDK**:
   - Install: `npm install @reclaimprotocol/js-sdk`
   - Update `app/api/generate-verification-url/route.ts` with actual SDK integration
   - Ensure SDK supports passing metadata via context that gets returned in callbacks
   - Configure redirect URLs to include all metadata as query parameters

3. **Security**:
   - Validate signatures on incoming requests
   - Use HTTPS in production
   - Implement rate limiting
   - Sanitize and validate callback URLs
   - Consider encrypting sensitive data in URL parameters if needed

4. **Environment Variables**:
   - Set all required environment variables
   - Use secure secrets management

5. **URL Length Limits**:
   - Be aware of URL length limits (typically 2048 characters)
   - Consider using signed tokens instead of passing all data if URLs get too long
   - Use URL-safe encoding for all parameters

## Architecture

```
verification-portal/
├── app/
│   ├── api/
│   │   ├── providers/           # Get providers by bundle (stateless)
│   │   ├── generate-verification-url/  # Generate Reclaim URL (stateless)
│   │   ├── verification-status/ # Optional status check (stateless)
│   │   └── reclaim-callback/    # Receive & forward proofs (stateless)
│   └── verify/
│       ├── page.tsx            # Provider selection (metadata in URL)
│       ├── process/page.tsx    # Iframe verification (metadata in URL)
│       └── status/page.tsx     # Status tracking (metadata in URL)
├── components/
│   ├── TopBar.tsx              # Reclaim branding
│   ├── ProviderSelector.tsx    # Bundle router
│   └── bundles/
│       ├── MiamiUniversityBundle.tsx
│       └── DefaultBundle.tsx
└── types/
    └── index.ts                # TypeScript interfaces
```

## How Metadata Flows (Stateless)

```
External Site
    ↓ (all metadata in URL)
/verify (Provider Selection)
    ↓ (all metadata in URL)
/verify/process (Generate SDK URL)
    ↓ (metadata in Reclaim SDK context)
Reclaim Protocol Verification
    ↓ (Reclaim calls back with metadata)
/api/reclaim-callback (Forward to external callback)
    ↓ (Reclaim redirects with metadata in URL)
/verify/status?status=success&sessionId=...&applicationId=...
    ↓ (User sees success message)
User closes window
```

## License

MIT
