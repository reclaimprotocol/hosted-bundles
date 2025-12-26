import { verifyMessage } from 'ethers';

/**
 * Verify that a signature was created by signing the given data with the applicationId's private key
 * @param data - The data that was signed
 * @param signature - The signature to verify
 * @param expectedAddress - The applicationId (Ethereum address) that should have signed
 * @returns true if signature is valid, false otherwise
 */
export function verifySignature(
  data: Record<string, string>,
  signature: string,
  expectedAddress: string
): boolean {
  try {
    // Sort keys to ensure consistent ordering
    const sortedKeys = Object.keys(data).sort();
    const message = sortedKeys.map(key => `${key}:${data[key]}`).join('|');

    // Recover the address from the signature
    const recoveredAddress = verifyMessage(message, signature);

    // Compare addresses (case-insensitive)
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Create a message to sign from the verification parameters
 * @param params - The parameters to sign
 * @returns The formatted message string
 */
export function createSignatureMessage(params: {
  applicationId: string;
  bundleId: string;
  callbackUrl: string;
  sessionId: string;
}): string {
  const data = {
    applicationId: params.applicationId,
    bundleId: params.bundleId,
    callbackUrl: params.callbackUrl,
    sessionId: params.sessionId,
  };

  const sortedKeys = Object.keys(data).sort();
  return sortedKeys.map(key => `${key}:${data[key as keyof typeof data]}`).join('|');
}
