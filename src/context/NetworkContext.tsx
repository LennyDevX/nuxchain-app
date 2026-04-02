/**
 * Context para gestionar la red seleccionada globalmente en la aplicación
 * Permite cambiar entre Polygon (EVM) y Solana desde cualquier componente
 */

import { useState, useMemo, type ReactNode } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAccount } from 'wagmi'
import { DEFAULT_SOLANA_NETWORK, type SolanaNetwork } from '../constants/solana'
import { NetworkContext, type NetworkContextType, type ActiveNetwork } from './createNetworkContext'

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const { publicKey, connected } = useWallet()
  const { address, isConnected } = useAccount()
  const [activeNetwork, setActiveNetwork] = useState<ActiveNetwork>('evm')
  const [solanaNetwork, setSolanaNetwork] = useState<SolanaNetwork>(DEFAULT_SOLANA_NETWORK)

  // Información sobre conexión Solana (para referencia en el contexto)
  const isSolanaConnectedMemo = useMemo(() => connected && !!publicKey, [connected, publicKey])

  const value: NetworkContextType = {
    activeNetwork,
    setActiveNetwork,
    solanaNetwork,
    setSolanaNetwork,
    isEVMConnected: isConnected,
    isSolanaConnected: isSolanaConnectedMemo,
    evmAddress: address || null,
    solanaAddress: publicKey?.toBase58() || null,
  }

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  )
}
