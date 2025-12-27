/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly define environment variables for server-side API routes
  env: {
    RECLAIM_APP_ID: process.env.RECLAIM_APP_ID,
    RECLAIM_APP_SECRET: process.env.RECLAIM_APP_SECRET,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
};

module.exports = nextConfig;
