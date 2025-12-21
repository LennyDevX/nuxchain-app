import { useQuery } from '@tanstack/react-query'
import { usePublicClient } from 'wagmi'

interface GasInfo {
  gasPrice: bigint | null
  gasLevel: 'low' | 'normal' | 'high'
}

export function useGasPrice() {
  const publicClient = usePublicClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['gasPrice'],
    queryFn: async () => {
      if (!publicClient) throw new Error('Public client not available')
      const price = await publicClient.getGasPrice()

      if (!price) return null

      const priceInGwei = Number(price) / 1e9
      let level: 'low' | 'normal' | 'high' = 'normal'

      if (priceInGwei < 50) level = 'low'
      else if (priceInGwei > 100) level = 'high'

      return {
        gasPrice: price,
        gasLevel: level,
      } as GasInfo
    },
    enabled: !!publicClient,
    staleTime: 300000, // 5 minutes (Optimizado para evitar 429)
    refetchInterval: 300000, // Update every 5 minutes
    refetchOnWindowFocus: false, // Evita ráfagas al cambiar de pestaña
  })

  return {
    gasPrice: data?.gasPrice ?? null,
    gasLevel: data?.gasLevel ?? 'normal',
    isLoading,
    refetch
  }
}
