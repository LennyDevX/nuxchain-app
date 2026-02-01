/**
 * Hook para acceder al NetworkContext
 * Archivo separado para cumplir con react-refresh/only-export-components
 */

import { useContext } from 'react'
import { NetworkContext } from '../../context/createNetworkContext'

export const useNetworkContext = () => {
  const context = useContext(NetworkContext)
  if (context === undefined) {
    throw new Error('useNetworkContext must be used within a NetworkProvider')
  }
  return context
}
