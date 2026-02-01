/**
 * Hook para gestionar la conexión a wallets Solana
 * Similar a useAccount() de Wagmi pero para Solana
 */

import { useCallback, useEffect, useState, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Connection } from '@solana/web3.js'
import { DEFAULT_SOLANA_NETWORK, SOLANA_RPC_FALLBACKS, type SolanaNetwork } from '../../constants/solana'
import { useIsMobile } from '../mobile/useIsMobile'

interface SolanaAccount {
  address: string | null
  publicKey: PublicKey | null
  isConnected: boolean
  isConnecting: boolean
  isDisconnecting: boolean
}

interface SolanaWalletState extends SolanaAccount {
  wallet: string | null
  network: SolanaNetwork
  switchNetwork: (network: SolanaNetwork) => Promise<void>
  disconnect: () => Promise<void>
  balance: number | null
  isLoadingBalance: boolean
}

/**
 * Hook principal para gestionar Solana wallet
 */
export const useSolanaWallet = (): SolanaWalletState => {
  const {
    publicKey,
    connected,
    connecting,
    disconnecting,
    wallet,
    disconnect: walletDisconnect,
  } = useWallet()

  const [network, setNetwork] = useState<SolanaNetwork>(DEFAULT_SOLANA_NETWORK)
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  // Cargar balance cuando se conecta
  useEffect(() => {
    if (!publicKey || !connected) {
      setBalance(null)
      return
    }

    const loadBalance = async () => {
      try {
        setIsLoadingBalance(true)
        const fallbacks = SOLANA_RPC_FALLBACKS[network]
        let lastError = null

        for (const rpcUrl of fallbacks) {
          try {
            if (import.meta.env.DEV) {
              console.log(`[Solana Balance] Attempting balance fetch from: ${rpcUrl}`)
            }
            const connection = new Connection(rpcUrl, 'processed')
            const lamports = await connection.getBalance(publicKey)
            setBalance(lamports / 1e9)
            return // Success!
          } catch (err) {
            console.warn(`[Solana Balance] Failed to fetch from ${rpcUrl}:`, err)
            lastError = err
            continue // Try next fallback
          }
        }

        // If we reach here, all fallbacks failed
        throw lastError || new Error('All RPC fallbacks failed')
      } catch (error) {
        console.error('Error loading Solana balance after all retries:', error)
        setBalance(null)
      } finally {
        setIsLoadingBalance(false)
      }
    }

    loadBalance()
  }, [publicKey, connected, network])

  const switchNetwork = useCallback(async (newNetwork: SolanaNetwork) => {
    if (newNetwork === network) return

    // Nota: En Solana, no hay "switch network" como en EVM
    // El cambio de red es simplemente cambiar el RPC endpoint
    setNetwork(newNetwork)
    setBalance(null) // Reset balance durante el cambio
  }, [network])

  const disconnect = useCallback(async () => {
    try {
      await walletDisconnect()
    } catch (error) {
      console.error('Error disconnecting Solana wallet:', error)
    }
  }, [walletDisconnect])

  return {
    address: publicKey?.toBase58() || null,
    publicKey,
    isConnected: connected,
    isConnecting: connecting,
    isDisconnecting: disconnecting,
    wallet: wallet?.adapter.name || null,
    network,
    switchNetwork,
    disconnect,
    balance,
    isLoadingBalance,
  }
}

/**
 * Hook para detectar wallets disponibles
 */
export const useSolanaWalletDetection = () => {
  const { wallets } = useWallet()
  const isMobile = useIsMobile()

  const hasPhantom = useMemo(() => wallets.some(w => w.adapter.name === 'Phantom' && (w.readyState === 'Installed' || w.readyState === 'Loadable')), [wallets])
  const hasOKX = useMemo(() => wallets.some(w => w.adapter.name.includes('OKX') && (w.readyState === 'Installed' || w.readyState === 'Loadable')), [wallets])
  const availableWallets = useMemo(
    () => wallets?.filter((w) => w.readyState === 'Installed' || w.readyState === 'Loadable' || (isMobile && (w.adapter.name === 'Phantom' || w.adapter.name.includes('OKX')))).map((w) => w.adapter.name) || [],
    [wallets, isMobile]
  )

  return {
    hasPhantom,
    hasOKX,
    availableWallets,
  }
}

/**
 * Hook para verificar si una dirección es válida en Solana
 */
export const useValidateSolanaAddress = (address: string | null | undefined) => {
  const isValid = useMemo(() => {
    if (!address) {
      return false
    }

    try {
      const publicKey = new PublicKey(address)
      return publicKey.toBase58().length > 0
    } catch {
      return false
    }
  }, [address])

  return isValid
}

/**
 * Hook para obtener información del explorer de Solana
 */
export const useSolanaExplorer = (network: SolanaNetwork = DEFAULT_SOLANA_NETWORK) => {
  const baseUrl = network === 'mainnet-beta' ? 'https://solscan.io' : `https://solscan.io?cluster=${network}`

  return {
    getTxUrl: (txHash: string) => `${baseUrl}/tx/${txHash}`,
    getAddressUrl: (address: string) => `${baseUrl}/account/${address}`,
    getTokenUrl: (mint: string) => `${baseUrl}/token/${mint}`,
    baseUrl,
  }
}
