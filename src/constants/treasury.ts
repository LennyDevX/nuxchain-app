/**
 * Treasury Constants
 * 
 * Defines enums and metadata for the polygon TreasuryManager contract (V6.0).
 * Used by hooks like useTreasuryHealth.
 */

/**
 * TreasuryType (enum compatible with smart contract)
 */
export const TreasuryType = {
  REWARDS: 0,
  STAKING: 1,
  COLLABORATORS: 2,
  DEVELOPMENT: 3,
  MARKETPLACE: 4,
} as const;
export type TreasuryType = (typeof TreasuryType)[keyof typeof TreasuryType];

/**
 * Human-friendly labels for TreasuryType
 */
export const TREASURY_TYPE_LABELS: Record<TreasuryType, string> = {
  [TreasuryType.REWARDS]: "Rewards Quest / Marketplace",
  [TreasuryType.STAKING]: "Smart Staking",
  [TreasuryType.COLLABORATORS]: "Collaborator Badges",
  [TreasuryType.DEVELOPMENT]: "Ecosystem Development",
  [TreasuryType.MARKETPLACE]: "Vault Reserved"
};

/**
 * ProtocolStatus (enum compatible with smart contract)
 */
export const ProtocolStatus = {
  HEALTHY: 0,
  UNSTABLE: 1,
  CRITICAL: 2,
  EMERGENCY: 3,
} as const;
export type ProtocolStatus = (typeof ProtocolStatus)[keyof typeof ProtocolStatus];

/**
 * Human-friendly labels for ProtocolStatus
 */
export const PROTOCOL_STATUS_LABELS: Record<ProtocolStatus, string> = {
  [ProtocolStatus.HEALTHY]: "Healthy",
  [ProtocolStatus.UNSTABLE]: "Unstable",
  [ProtocolStatus.CRITICAL]: "Critical Deficit",
  [ProtocolStatus.EMERGENCY]: "System Emergency"
};

/**
 * Treasury Deployment Configuration
 */
// Fallback if VITE_TREASURY_MANAGER_ADDRESS is missing
const DEFAULT_TREASURY_ADDRESS = "0x7890123456789012345678901234567890123456";

/**
 * Resolves the TreasuryManager address from environment variables
 */
export function getTreasuryManagerAddress(): string {
  if (typeof window !== "undefined" && (window as any).__ENV__) {
    return (window as any).__ENV__.VITE_TREASURY_MANAGER_ADDRESS ?? DEFAULT_TREASURY_ADDRESS;
  }
  return import.meta.env.VITE_TREASURY_MANAGER_ADDRESS ?? DEFAULT_TREASURY_ADDRESS;
}
