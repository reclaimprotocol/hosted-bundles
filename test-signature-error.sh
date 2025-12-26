#!/bin/bash
curl -X POST http://localhost:3000/api/generate-verification-url \
  -H 'Content-Type: application/json' \
  -d '{
    "applicationId": "0x1234567890123456789012345678901234567890",
    "bundleId": "education",
    "sessionId": "test-session-123",
    "providerId": "6b25299b-1e2b-4a9a-93ca-0e50ed2bcf69",
    "callbackUrl": "https://example.com/callback",
    "signature": "0xinvalidsignature"
  }'
