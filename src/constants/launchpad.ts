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
      maxBuy: 500_000,          // NUX per wallet
      cap: 8_000_000,           // Total NUX available (8% of supply)
      start: new Date('2026-03-02T00:00:00Z'),
      end: new Date('2026-03-14T23:59:59Z'),
      requiresWhitelist: true,
      color: 'emerald',
      description: 'Exclusive access for Airdrop participants',
    },
    2: {
      id: 2,
      label: 'PRESALE',
      badge: 'TIER 2',
      price: 0.000025,
      discount: 'Public',
      minBuy: 1_000,
      maxBuy: 500_000,
      cap: 7_000_000,           // Total NUX available (7% of supply)
      start: new Date('2026-03-15T00:00:00Z'),
      end: new Date('2026-03-22T23:59:59Z'),
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
      description: 'Raydium liquidity pool opens. Price determined by market.',
    },
  },
} as const;

export type TierId = 1 | 2 | 3;

/**
 * Returns the currently active tier based on today's date.
 * Returns null if no tier is active (e.g. between phases or before launch).
 */
export function getActiveTier(): TierId | null {
  const now = new Date();
  const { tiers } = LAUNCHPAD_CONFIG;

  if (now >= tiers[1].start && now <= tiers[1].end) return 1;
  if (now >= tiers[2].start && now <= tiers[2].end) return 2;
  if (now >= tiers[3].start) return 3;
  return null;
}

/**
 * Returns the phase status label for a tier card.
 */
export function getTierStatus(tierId: TierId): 'upcoming' | 'live' | 'ended' {
  const now = new Date();
  const tier = LAUNCHPAD_CONFIG.tiers[tierId];

  if (now < tier.start) return 'upcoming';
  if (tier.end && now > tier.end) return 'ended';
  return 'live';
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
