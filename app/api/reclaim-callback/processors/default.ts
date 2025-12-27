import { ProofProcessor, ProcessedProof } from './types';

export class DefaultProcessor implements ProofProcessor {
  process(extractedParameters: Record<string, any>): ProcessedProof {
    try {
      console.log('Default processor received parameters:', extractedParameters);

      // Return extracted parameters as-is
      return {
        success: true,
        data: extractedParameters,
        metadata: {
          verified: true,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error('Error processing default proof:', error);
      return {
        success: false,
        data: {
          error: 'Failed to process proof',
          details: String(error),
        },
        metadata: {
          verified: false,
          timestamp: Date.now(),
        },
      };
    }
  }
}
