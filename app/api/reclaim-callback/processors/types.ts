// Base processor interface
export interface ProofProcessor {
  process(extractedParameters: Record<string, any>): ProcessedProof;
}

// Output format after processing
export interface ProcessedProof {
  success: boolean;
  data: Record<string, any>;
  metadata: {
    verified: boolean;
    timestamp?: number;
  };
}
