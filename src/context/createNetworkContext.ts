/**
 * Definición del contexto NetworkContext y tipos asociados
 * Archivo separado para cumplir con react-refresh/only-export-components
 */

import { createContext } from 'react'
import type { SolanaNetwork } from '../constants/solana'

export type ActiveNetwork = 'evm' | 'solana'

export interface NetworkContextType {
  activeNetwork: ActiveNetwork
  setActiveNetwork: (network: ActiveNetwork) => void
  solanaNetwork: SolanaNetwork
  setSolanaNetwork: (network: SolanaNetwork) => void
  isEVMConnected: boolean
  isSolanaConnected: boolean
  evmAddress: string | null
  solanaAddress: string | null
}

export const NetworkContext = createContext<NetworkContextType | undefined>(undefined)
