import { PublicKey } from '@solana/web3.js'

// ─── NUX Token ───────────────────────────────────────────────────────────────
// NUX is a Solana SPL Token with 6 decimal places.
export const NUX_DECIMALS = 6
export const NUX_MINT_ADDRESS = import.meta.env.VITE_NUX_MINT_ADDRESS ?? ''

// ─── P2P Escrow Program ───────────────────────────────────────────────────────
// TODO: After `anchor build && anchor deploy` on devnet/mainnet:
//   1. Run: solana address -k target/deploy/nux_p2p_escrow-keypair.json
//   2. Set VITE_P2P_PROGRAM_ID=<your_program_id> in your .env file
//   3. Set VITE_P2P_DEPLOYED=true in your .env file
//   See programs/nux-p2p-escrow/DEPLOY.md for the full guide.
export const P2P_PROGRAM_ID_STR = import.meta.env.VITE_P2P_PROGRAM_ID ?? 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
export const IS_P2P_DEPLOYED = import.meta.env.VITE_P2P_DEPLOYED === 'true'

export const P2P_PROGRAM_ID = new PublicKey(P2P_PROGRAM_ID_STR)

export const LAMPORTS_PER_SOL = 1_000_000_000n
export const NUX_RAW_UNIT = 1_000_000n  // 1 NUX = 1,000,000 raw units (6 decimals)

// ─── PDA Helpers ─────────────────────────────────────────────────────────────
export function getMarketplacePDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('marketplace')],
    P2P_PROGRAM_ID
  )
}

export function getAdPDA(creator: PublicKey, adId: bigint): [PublicKey, number] {
  const idBuffer = Buffer.alloc(8)
  idBuffer.writeBigUInt64LE(adId)
  return PublicKey.findProgramAddressSync(
    [Buffer.from('ad'), creator.toBuffer(), idBuffer],
    P2P_PROGRAM_ID
  )
}

export function getVaultPDA(creator: PublicKey, adId: bigint): [PublicKey, number] {
  const idBuffer = Buffer.alloc(8)
  idBuffer.writeBigUInt64LE(adId)
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), creator.toBuffer(), idBuffer],
    P2P_PROGRAM_ID
  )
}

// ─── Display Helpers ─────────────────────────────────────────────────────────
export function rawNuxToDisplay(rawAmount: bigint): number {
  return Number(rawAmount) / 1e6
}

export function displayNuxToRaw(displayAmount: number): bigint {
  return BigInt(Math.round(displayAmount * 1e6))
}

export function lamportsToSol(lamports: bigint): number {
  return Number(lamports) / 1e9
}

export function solToLamports(sol: number): bigint {
  return BigInt(Math.round(sol * 1e9))
}

// Generates a monotonically increasing ad ID from timestamp + random suffix
export function generateAdId(): bigint {
  const ts = BigInt(Date.now())
  const rand = BigInt(Math.floor(Math.random() * 1000))
  return ts * 1000n + rand
}
