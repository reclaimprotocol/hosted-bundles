import { ProofProcessor, ProcessedProof } from './types';

export class EducationProcessor implements ProofProcessor {
  process(extractedParameters: Record<string, any>): ProcessedProof {
    try {
      console.log('Education processor received parameters:', extractedParameters);

      // Build the formatted response for education verification
      const formattedData = {
        fullName: extractedParameters.fullName || extractedParameters.pageTitle || 'N/A',
        verified: true,
      };

      if(!formattedData.fullName || formattedData.fullName === 'N/A') {
        throw new Error('Full name not found in extracted parameters');
      }

      return {
        success: true,
        data: formattedData,
        metadata: {
          verified: true,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error('Error processing education proof:', error);
      return {
        success: false,
        data: {
          error: 'Failed to process education proof',
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
