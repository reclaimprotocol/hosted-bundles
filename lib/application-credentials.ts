import { Wallet } from 'ethers';

/**
 * Get application credentials for verification
 *
 * FOR PRODUCTION USE:
 * Replace this function to return your actual credentials from dev.reclaimprotocol.org
 *
 * Example production implementation:
 *
 * export function getApplicationCredentials() {
 *   return {
 *     applicationId: process.env.YOUR_APPLICATION_ID,
 *     applicationSecret: process.env.YOUR_APPLICATION_SECRET
 *   };
 * }
 */
export function getApplicationCredentials() {
  // DEMO ONLY: Generate a random wallet for testing
  // In production, replace this with your actual credentials from dev.reclaimprotocol.org
  const wallet = Wallet.createRandom();

  return {
    applicationId: wallet.address,
    applicationSecret: wallet.privateKey
  };
}
