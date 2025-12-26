export interface VerificationParams {
  applicationId: string;
  bundleId: string;
  callbackUrl: string;
  sessionId: string;
  providerId?: string;
  signature: string;
}

export interface Provider {
  id: string;
  name: string;
  bundleId: string;
}

export interface BundleConfig {
  id: string;
  name: string;
  providers: Provider[];
}
