import { ProofProcessor, ProcessedProof } from './types';

export class DefaultProcessor implements ProofProcessor {
  process(extractedParameters: Record<string, any>): ProcessedProof {
    try {
      console.log('Default processor received parameters:', extractedParameters);

      // Build a generic formatted response
      const formattedData = {
        // User information
        userId: extractedParameters.userId || extractedParameters.id || '',
        email: extractedParameters.email || '',
        name: extractedParameters.name || '',

        // Include all extracted parameters
        verifiedData: extractedParameters,

        // Status
        verified: true,
      };

      return {
        success: true,
        data: formattedData,
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
