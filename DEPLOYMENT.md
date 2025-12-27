# Deployment Guide

## AWS Amplify Deployment

### Prerequisites
- AWS Account
- Reclaim Protocol App ID and Secret

### Step 1: Configure Environment Variables

In AWS Amplify Console:
1. Navigate to your app
2. Go to **App Settings** → **Environment variables**
3. Add the following variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `RECLAIM_APP_ID` | Your Reclaim Protocol App ID | ✅ Yes |
| `RECLAIM_APP_SECRET` | Your Reclaim Protocol App Secret | ✅ Yes |
| `NEXT_PUBLIC_BASE_URL` | Your Amplify app URL (e.g., https://main.xxx.amplifyapp.com) | ⚠️ Recommended |

**Important Notes:**
- Do **NOT** prefix `RECLAIM_APP_ID` and `RECLAIM_APP_SECRET` with `NEXT_PUBLIC_` - these are server-side secrets
- Only `NEXT_PUBLIC_BASE_URL` should have the `NEXT_PUBLIC_` prefix as it's used client-side
- After adding variables, you must **redeploy** your app

### Step 2: Deploy

#### Option A: Connect GitHub Repository
1. In Amplify Console, click **New app** → **Host web app**
2. Connect your GitHub repository
3. Amplify will detect Next.js and use the `amplify.yml` configuration automatically
4. Click **Save and deploy**

#### Option B: Deploy from Local
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify (first time only)
amplify init

# Deploy
amplify publish
```

### Step 3: Verify Deployment

1. Check the build logs for the line:
   ```
   RECLAIM_APP_ID=xxxxx
   RECLAIM_APP_SECRET=xxxxx
   ```
   (The `env | grep` command in `amplify.yml` will show these)

2. If you see the variables, the deployment is correct
3. If variables are missing, go back to Step 1

### Troubleshooting

**Error: "applicationId in the constructor is null or undefined"**
- This means `RECLAIM_APP_ID` or `RECLAIM_APP_SECRET` is not set
- Check environment variables in Amplify Console
- Redeploy after adding variables

**Error: "Invalid signature"**
- Make sure you're using the correct `NEXT_PUBLIC_BASE_URL`
- The callback URLs must match your deployed domain

**Build fails**
- Check build logs in Amplify Console
- Ensure all dependencies are in `package.json`
- Verify `amplify.yml` is in the repository root

### Environment Variables Reference

Copy `.env.example` to `.env` for local development:
```bash
cp .env.example .env
# Edit .env with your actual values
```

**Never commit `.env` to git!** It's already in `.gitignore`.

---

## Helper Endpoints

### Generate Signed URL

**Endpoint:** `POST /api/helper/generate-signed-url`

Generate a properly signed verification URL without implementing the signing logic yourself.

**Request:**
```json
{
  "applicationSecret": "YOUR_APPLICATION_SECRET",
  "bundleId": "education",
  "callbackUrl": "https://your-app.com/callback",
  "sessionId": "unique-session-id",
  "providerId": "optional-provider-id"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://your-app.com/verify?applicationId=0x...&signature=0x...",
  "applicationId": "0x...",
  "signature": "0x..."
}
```

### Verify Callback Signature

**Endpoint:** `POST /api/helper/verify-callback`

Verify that a callback payload came from the verification portal.

**Request:**
Pass the entire callback payload as-is:
```json
{
  "data": {
    "sessionId": "...",
    "applicationId": "...",
    "bundleId": "...",
    "proofs": [...],
    "timestamp": "..."
  },
  "signature": "0x..."
}
```

**Response (Success):**
```json
{
  "verified": true,
  "score": 100,
  "message": "Signature verified successfully",
  "signer": "0x..."
}
```

**Response (Failed):**
```json
{
  "verified": false,
  "score": 0,
  "message": "Invalid signature",
  "details": {
    "expectedSigner": "0x...",
    "recoveredSigner": "0x..."
  }
}
```

**Example Usage (Node.js):**
```javascript
// In your callback endpoint
app.post('/callback', async (req, res) => {
  const payload = req.body; // { data, signature }

  // Verify the signature
  const verifyResponse = await fetch('https://your-verification-portal.com/api/helper/verify-callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await verifyResponse.json();

  if (result.verified && result.score === 100) {
    // Signature is valid, process the verification
    console.log('Verification proof is authentic!');
    // Access the data safely
    const { proofs } = payload.data;
  } else {
    // Signature is invalid, reject
    console.log('Invalid signature, possible tampering!');
  }

  res.json({ success: true });
});
```
