import { ProofProcessor } from './types';
import { EducationProcessor } from './education';
import { DefaultProcessor } from './default';

// Registry of processors by bundle ID
const processors: Record<string, ProofProcessor> = {
  education: new EducationProcessor(),
  default: new DefaultProcessor(),
};

/**
 * Get the appropriate processor for a bundle
 * @param bundleId - The bundle identifier
 * @returns The processor for the bundle, or default processor if not found
 */
export function getProcessor(bundleId: string): ProofProcessor {
  return processors[bundleId] || processors.default;
}

// Export types and processors
export * from './types';
export { EducationProcessor } from './education';
export { DefaultProcessor } from './default';
