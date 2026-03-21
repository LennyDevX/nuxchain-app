import { PublicKey } from '@solana/web3.js'

export type AdType = 'sell' | 'buy'
export type AdStatus = 'active' | 'fulfilled' | 'cancelled'

export interface P2PAd {
  // On-chain fields
  adId: bigint
  creator: PublicKey
  adType: AdType
  nuxAmount: bigint              // raw units (NUX has 6 decimals)
  priceLamportsPerNux: bigint    // SOL lamports per 1 raw NUX unit
  description: string
  status: AdStatus
  createdAt: number              // unix timestamp
  fulfilledAt: number            // unix timestamp (0 if not fulfilled)
  counterparty: PublicKey        // buyer pubkey (default if not fulfilled)
  bump: number
  vaultBump: number

  // Derived / display fields (populated by the hook)
  pda?: PublicKey
  nuxAmountDisplay?: number      // human-readable (nuxAmount / 1e6)
  pricePerNuxSol?: number        // SOL per NUX (priceLamportsPerNux / 1e9)
  totalSolCost?: number          // total SOL cost = nuxAmountDisplay * pricePerNuxSol
}

export interface MarketplaceState {
  admin: PublicKey
  nuxMint: PublicKey
  feeBasisPoints: number
  referencePriceLamports: bigint
  minAdAmount: bigint
  totalAds: bigint
  totalVolumeNux: bigint
  paused: boolean
  bump: number

  // Display
  referencePriceSol?: number     // referencePriceLamports / 1e9
}

export interface CreateAdFormData {
  nuxAmount: string              // human readable input
  pricePerNux: string            // SOL per NUX, human readable
  description: string
}

export interface CreateAdTxParams {
  nuxAmountRaw: bigint
  priceLamportsPerNux: bigint
  description: string
  adId: bigint
}
