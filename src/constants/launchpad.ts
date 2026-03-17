/**
 * NuxChain Launchpad Configuration
 * Central source of truth for all presale/whitelist phases.
 * Update VITE_DEPLOYER_NUX in .env with the Solana wallet that receives payments.
 */

export const LAUNCHPAD_CONFIG = {
  // Wallet that receives SOL payments from buyers
  // Set VITE_DEPLOYER_NUX in .env
  treasuryWallet: import.meta.env.VITE_DEPLOYER_NUX as string,

  // NUX Token mint address on Solana (fill after deploying token)
  nuxMintAddress: import.meta.env.VITE_NUX_MINT_ADDRESS as string || '',

  tiers: {
    1: {
      id: 1,
      label: 'WHITELIST',
      badge: 'TIER 1',
      price: 0.000015,          // SOL per NUX
      discount: '40% off',
      minBuy: 5_000,            // NUX
      maxBuy: 200_000,          // NUX per wallet - limitado para evitar whales
      cap: 12_000_000,          // Total NUX available (12% of supply) - INCREASED
      start: new Date('2026-03-02T00:00:00Z'),
      end: null,                  // No date-based close — ends at 80% cap
      requiresWhitelist: false,
      color: 'emerald',
      description: 'Early access with best price',
    },
    2: {
      id: 2,
      label: 'PRESALE',
      badge: 'TIER 2',
      price: 0.000025,
      discount: 'Public',
      minBuy: 1_000,
      maxBuy: 500_000,          // NUX per wallet - más permisivo por pool más grande
      cap: 13_000_000,          // Total NUX available (13% of supply) - INCREASED
      start: new Date('2026-03-15T00:00:00Z'),
      end: null,                  // No date-based close — ends at 80% cap
      requiresWhitelist: false,
      color: 'blue',
      description: 'Open to all participants',
    },
    3: {
      id: 3,
      label: 'LP / TGE',
      badge: 'TIER 3',
      price: 0.00004,           // Initial LP price (market-determined after)
      discount: 'Market',
      minBuy: null,
      maxBuy: null,
      cap: null,                // No cap — open market
      start: new Date('2026-03-24T00:00:00Z'),
      end: null,
      requiresWhitelist: false,
      color: 'purple',
      description: 'NuxChain liquidity pool opens. Price determined by market.',
    },
  },
} as const;

export type TierId = 1 | 2 | 3;

/** Minimum fraction of cap sold for a phase to be considered successful and advance. */
export const PHASE_SUCCESS_THRESHOLD = 0.80;

type StatsArg =
  | { tier1?: { nuxSold: number } | null; tier2?: { nuxSold: number } | null }
  | null
  | undefined;

/** Returns true once a tier has sold ≥80% of its allocation. */
export function isTierComplete(tierId: 1 | 2, stats?: StatsArg): boolean {
  if (!stats) return false;
  const tierStats = tierId === 1 ? stats.tier1 : stats.tier2;
  const cap = LAUNCHPAD_CONFIG.tiers[tierId].cap;
  if (!cap || !tierStats) return false;
  return tierStats.nuxSold / cap >= PHASE_SUCCESS_THRESHOLD;
}

/**
 * Returns the currently active tier based on objective progress (80% threshold).
 * Tier 1 is live first; each subsequent tier unlocks once the previous hits 80% of cap.
 */
export function getActiveTier(stats?: StatsArg): TierId | null {
  if (!isTierComplete(1, stats)) return 1;
  if (!isTierComplete(2, stats)) return 2;
  return 3;
}

/**
 * Returns the phase status for a tier card based on objective progress.
 * Phases never close on a date — only when 80% of their cap is sold.
 */
export function getTierStatus(tierId: TierId, stats?: StatsArg): 'upcoming' | 'live' | 'ended' {
  const t1Done = isTierComplete(1, stats);
  const t2Done = isTierComplete(2, stats);

  if (tierId === 1) return t1Done ? 'ended' : 'live';
  if (tierId === 2) {
    if (!t1Done) return 'upcoming';
    return t2Done ? 'ended' : 'live';
  }
  // Tier 3 (LP / TGE): opens once both presale phases are complete
  return t1Done && t2Done ? 'live' : 'upcoming';
}

/**
 * Calculates NUX amount from SOL input for a given tier.
 */
export function solToNux(solAmount: number, tierId: TierId): number {
  return Math.floor(solAmount / LAUNCHPAD_CONFIG.tiers[tierId].price);
}

/**
 * Calculates SOL cost from NUX amount for a given tier.
 */
export function nuxToSol(nuxAmount: number, tierId: TierId): number {
  return nuxAmount * LAUNCHPAD_CONFIG.tiers[tierId].price;
}
