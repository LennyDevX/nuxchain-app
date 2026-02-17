/**
 * useStakingContext Hook
 * Extracted from StakingContext.tsx to comply with react-refresh/only-export-components rule
 */

import { useContext } from 'react';
import { StakingContext } from './StakingContextDefinition';
import type { StakingContextType } from './StakingContext.types';

/**
 * Hook to access StakingContext
 * Must be used within a StakingProvider
 * @throws Error if used outside of StakingProvider
 */
export function useStakingContext(): StakingContextType {
  const context = useContext(StakingContext);
  if (!context) {
    throw new Error('useStakingContext must be used within a StakingProvider');
  }
  return context;
}

/**
 * Optional hook that returns null when outside StakingProvider
 * Useful for components that may be rendered outside staking page
 */
export function useOptionalStakingContext(): StakingContextType | null {
  return useContext(StakingContext);
}
