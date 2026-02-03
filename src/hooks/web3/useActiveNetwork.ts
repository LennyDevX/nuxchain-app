/**
 * Hook para acceder a la red seleccionada globalmente
 * Uso: const { activeNetwork, setActiveNetwork } = useActiveNetwork()
 */

import { useNetworkContext } from './useNetworkContext'

export const useActiveNetwork = () => {
  const context = useNetworkContext()
  return {
    activeNetwork: context.activeNetwork,
    setActiveNetwork: context.setActiveNetwork,
    solanaNetwork: context.solanaNetwork,
    setSolanaNetwork: context.setSolanaNetwork,
    isEVMConnected: context.isEVMConnected,
    isSolanaConnected: context.isSolanaConnected,
    evmAddress: context.evmAddress,
    solanaAddress: context.solanaAddress,
  }
}
