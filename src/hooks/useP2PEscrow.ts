/**
 * useP2PEscrow — Hooks for the NuxChain P2P OTC Marketplace
 *
 * Fully implemented with @coral-xyz/anchor ^0.32.1
 * Guarded by IS_P2P_DEPLOYED (VITE_P2P_DEPLOYED=true) until the
 * contract is live on-chain.
 *
 * After deploy:
 *   1. Set VITE_P2P_PROGRAM_ID=<deployed_program_id> in .env
 *   2. Set VITE_P2P_DEPLOYED=true in .env
 *   3. Call initialize_marketplace once from the Admin dashboard
 */

import { useCallback, useEffect, useState } from 'react'
import { useWallet, useConnection, useAnchorWallet } from '@solana/wallet-adapter-react'
import { Program, AnchorProvider, BN, type Idl } from '@coral-xyz/anchor'
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js'
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token'
import type { P2PAd, MarketplaceState, CreateAdFormData } from '../types/p2p'
import { IDL } from '../types/nux_p2p_escrow_idl'
import {
  IS_P2P_DEPLOYED,
  NUX_MINT_ADDRESS,
  getMarketplacePDA,
  getAdPDA,
  getVaultPDA,
  displayNuxToRaw,
  solToLamports,
  generateAdId,
  rawNuxToDisplay,
  lamportsToSol,
} from '../constants/p2p'

const PROGRAM_NOT_DEPLOYED_MSG =
  'P2P Market contract is being deployed. Trading will be enabled soon!'

const NUX_MINT = new PublicKey(NUX_MINT_ADDRESS)

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: build read-only AnchorProvider (no wallet needed for reads)
// ─────────────────────────────────────────────────────────────────────────────
function buildReadProvider(connection: ReturnType<typeof useConnection>['connection']) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new AnchorProvider(connection, { publicKey: PublicKey.default } as any, {
    commitment: 'confirmed',
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: emit giveaway tracking event after a successful trade
// ─────────────────────────────────────────────────────────────────────────────
function emitTradeEvent(txSignature: string, type: 'buy' | 'sell', nuxAmount: bigint) {
  try {
    window.dispatchEvent(
      new CustomEvent('nuxP2PTradeCompleted', {
        detail: {
          txSignature,
          type,
          amount: rawNuxToDisplay(nuxAmount),
          timestamp: Date.now(),
        },
      })
    )
  } catch {
    // Non-critical — giveaway tracking should never block trades
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Marketplace state hook
// ─────────────────────────────────────────────────────────────────────────────
export function useMarketplaceState() {
  const { connection } = useConnection()
  const [state, setState] = useState<MarketplaceState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchState = useCallback(async () => {
    if (!IS_P2P_DEPLOYED) return
    setLoading(true)
    setError(null)
    try {
      const provider = buildReadProvider(connection)
      const program = new Program(IDL as unknown as Idl, provider)
      const [marketplacePDA] = getMarketplacePDA()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await (program.account as any).marketplace.fetch(marketplacePDA)
      setState({
        admin: raw.admin as PublicKey,
        nuxMint: raw.nuxMint as PublicKey,
        feeBasisPoints: raw.feeBasisPoints as number,
        referencePriceLamports: BigInt(raw.referencePriceLamports.toString()),
        minAdAmount: BigInt(raw.minAdAmount.toString()),
        totalAds: BigInt(raw.totalAds.toString()),
        totalVolumeNux: BigInt(raw.totalVolumeNux.toString()),
        paused: raw.paused as boolean,
        bump: raw.bump as number,
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('Account does not exist')) {
        setError('Marketplace not initialized yet. Call initialize_marketplace from Admin.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }, [connection])

  useEffect(() => {
    fetchState()
    const interval = setInterval(fetchState, 30_000)
    return () => clearInterval(interval)
  }, [fetchState])

  return { state, loading, error, refetch: fetchState }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Active ads hook
// ─────────────────────────────────────────────────────────────────────────────
export function useActiveAds() {
  const { connection } = useConnection()
  const [ads, setAds] = useState<P2PAd[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAds = useCallback(async () => {
    if (!IS_P2P_DEPLOYED) return
    setLoading(true)
    setError(null)
    try {
      const provider = buildReadProvider(connection)
      const program = new Program(IDL as unknown as Idl, provider)

      // Anchor 0.32 memcmp filter: discriminator at offset 0 (8 bytes), then status at offset...
      // Ad layout: [discriminator(8)] [adId(8)] [creator(32)] [adType(1)] [nuxAmount(8)]
      //            [priceLamportsPerNux(8)] [description(4+200)] [status(1)] ...
      // Status offset: 8 + 8 + 32 + 1 + 8 + 8 + (4 + 200) = 269
      // AdStatus::Active = 0

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawAds = await (program.account as any).ad.all([
        {
          memcmp: {
            offset: 269, // status field offset
            bytes: '1', // base58 of byte 0 = AdStatus::Active
          },
        },
      ])

      const parsed: P2PAd[] = rawAds.map((item: { account: Record<string, unknown>; publicKey: PublicKey }) => {
        const a = item.account
        const nuxAmount = BigInt((a.nuxAmount as { toString(): string }).toString())
        const priceLamportsPerNux = BigInt((a.priceLamportsPerNux as { toString(): string }).toString())
        return {
          adId: BigInt((a.adId as { toString(): string }).toString()),
          creator: a.creator as PublicKey,
          adType: 'sell' as const,
          nuxAmount,
          priceLamportsPerNux,
          description: a.description as string,
          status: 'active' as const,
          createdAt: Number((a.createdAt as { toString(): string }).toString()),
          fulfilledAt: 0,
          counterparty: a.counterparty as PublicKey,
          bump: a.bump as number,
          vaultBump: a.vaultBump as number,
          pda: item.publicKey,
          nuxAmountDisplay: rawNuxToDisplay(nuxAmount),
          pricePerNuxSol: lamportsToSol(priceLamportsPerNux),
          totalSolCost: rawNuxToDisplay(nuxAmount) * lamportsToSol(priceLamportsPerNux),
        }
      })

      // Sort newest first by createdAt
      parsed.sort((a, b) => b.createdAt - a.createdAt)
      setAds(parsed)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load ads')
    } finally {
      setLoading(false)
    }
  }, [connection])

  useEffect(() => {
    fetchAds()
    const interval = setInterval(fetchAds, 15_000)
    return () => clearInterval(interval)
  }, [fetchAds])

  return { ads, loading, error, refetch: fetchAds }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Create sell ad hook
// ─────────────────────────────────────────────────────────────────────────────
export function useCreateSellAd() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const anchorWallet = useAnchorWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txSignature, setTxSignature] = useState<string | null>(null)

  const createAd = useCallback(async (formData: CreateAdFormData): Promise<boolean> => {
    if (!IS_P2P_DEPLOYED) { setError(PROGRAM_NOT_DEPLOYED_MSG); return false }
    if (!publicKey || !anchorWallet) { setError('Connect your wallet first'); return false }

    setLoading(true)
    setError(null)
    setTxSignature(null)

    try {
      const provider = new AnchorProvider(connection, anchorWallet, { commitment: 'confirmed' })
      const program = new Program(IDL as unknown as Idl, provider)

      const nuxAmountRaw = displayNuxToRaw(parseFloat(formData.nuxAmount))
      const priceLamports = solToLamports(parseFloat(formData.pricePerNux))
      const adId = generateAdId()

      const [marketplacePDA] = getMarketplacePDA()
      const [adPDA] = getAdPDA(publicKey, adId)
      const [vaultPDA] = getVaultPDA(publicKey, adId)
      const sellerATA = getAssociatedTokenAddressSync(NUX_MINT, publicKey)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tx = await (program.methods as any)
        .createSellAd(
          new BN(adId.toString()),
          new BN(nuxAmountRaw.toString()),
          new BN(priceLamports.toString()),
          formData.description,
        )
        .accounts({
          marketplace: marketplacePDA,
          ad: adPDA,
          escrowVault: vaultPDA,
          sellerNuxAccount: sellerATA,
          nuxMint: NUX_MINT,
          seller: publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .transaction()

      const sig = await sendTransaction(tx, connection)
      await connection.confirmTransaction(sig, 'confirmed')
      setTxSignature(sig)

      // Emit giveaway tracking event (seller side counts too)
      emitTradeEvent(sig, 'sell', nuxAmountRaw)

      return true
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Transaction failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [connection, publicKey, sendTransaction, anchorWallet])

  return { createAd, loading, error, txSignature }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Cancel ad hook
// ─────────────────────────────────────────────────────────────────────────────
export function useCancelAd() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const anchorWallet = useAnchorWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cancelAd = useCallback(async (ad: P2PAd): Promise<boolean> => {
    if (!IS_P2P_DEPLOYED || !publicKey || !anchorWallet) {
      setError(!IS_P2P_DEPLOYED ? PROGRAM_NOT_DEPLOYED_MSG : 'Connect your wallet')
      return false
    }

    setLoading(true)
    setError(null)
    try {
      const provider = new AnchorProvider(connection, anchorWallet, { commitment: 'confirmed' })
      const program = new Program(IDL as unknown as Idl, provider)

      const [adPDA] = getAdPDA(publicKey, ad.adId)
      const [vaultPDA] = getVaultPDA(publicKey, ad.adId)
      const creatorATA = getAssociatedTokenAddressSync(NUX_MINT, publicKey)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tx = await (program.methods as any)
        .cancelAd()
        .accounts({
          ad: adPDA,
          escrowVault: vaultPDA,
          creatorNuxAccount: creatorATA,
          nuxMint: NUX_MINT,
          creator: publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .transaction()

      const sig = await sendTransaction(tx, connection)
      await connection.confirmTransaction(sig, 'confirmed')
      return true
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Cancel failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [connection, publicKey, sendTransaction, anchorWallet])

  return { cancelAd, loading, error }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Fulfill (buy) ad hook — emits nuxP2PTradeCompleted for giveaway tracking
// ─────────────────────────────────────────────────────────────────────────────
export function useFulfillAd() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const anchorWallet = useAnchorWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txSignature, setTxSignature] = useState<string | null>(null)

  const fulfillAd = useCallback(async (ad: P2PAd): Promise<boolean> => {
    if (!IS_P2P_DEPLOYED || !publicKey || !anchorWallet) {
      setError(!IS_P2P_DEPLOYED ? PROGRAM_NOT_DEPLOYED_MSG : 'Connect your wallet')
      return false
    }
    if (ad.creator.equals(publicKey)) {
      setError('You cannot buy your own listing')
      return false
    }

    setLoading(true)
    setError(null)
    setTxSignature(null)
    try {
      const provider = new AnchorProvider(connection, anchorWallet, { commitment: 'confirmed' })
      const program = new Program(IDL as unknown as Idl, provider)

      // Fetch marketplace to get admin address
      const [marketplacePDA] = getMarketplacePDA()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mktRaw = await (program.account as any).marketplace.fetch(marketplacePDA)
      const adminKey = mktRaw.admin as PublicKey

      const [adPDA] = getAdPDA(ad.creator, ad.adId)
      const [vaultPDA] = getVaultPDA(ad.creator, ad.adId)
      const buyerATA = getAssociatedTokenAddressSync(NUX_MINT, publicKey)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tx = await (program.methods as any)
        .fulfillSellAd()
        .accounts({
          marketplace: marketplacePDA,
          ad: adPDA,
          escrowVault: vaultPDA,
          buyerNuxAccount: buyerATA,
          nuxMint: NUX_MINT,
          admin: adminKey,
          seller: ad.creator,
          buyer: publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .transaction()

      const sig = await sendTransaction(tx, connection)
      await connection.confirmTransaction(sig, 'confirmed')
      setTxSignature(sig)

      // ── Emit giveaway tracking event ──────────────────────────────────────
      // This is what the Giveaway page listens to via useGiveawayTracker.
      emitTradeEvent(sig, 'buy', ad.nuxAmount)

      return true
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Transaction failed')
      return false
    } finally {
      setLoading(false)
    }
  }, [connection, publicKey, sendTransaction, anchorWallet])

  return { fulfillAd, loading, error, txSignature }
}

