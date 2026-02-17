import { createContext } from 'react';
import type { StakingContextType } from './StakingContext.types';

// Define and export StakingContext
export const StakingContext = createContext<StakingContextType | null>(null);