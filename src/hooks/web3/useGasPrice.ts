import { useState, useCallback, useEffect } from 'react'
import { usePublicClient } from 'wagmi'

interface GasInfo {
  gasPrice: bigint | null
  gasLevel: 'low' | 'normal' | 'high'
}

export function useGasPrice() {
  const [gasInfo, setGasInfo] = useState<GasInfo>({
    gasPrice: null,
    gasLevel: 'normal',
  })
  const [isLoading, setIsLoading] = useState(false)
  const publicClient = usePublicClient()

  const fetchGasPrice = useCallback(async () => {
    if (!publicClient) return

    setIsLoading(true)
    try {
      const price = await publicClient.getGasPrice?.()
      
      if (price) {
        // Determinar nivel de congestión
        // Gas price típicos en Polygon:
        // Low: < 50 gwei
        // Normal: 50-100 gwei
        // High: > 100 gwei
        const priceInGwei = Number(price) / 1e9
        let level: 'low' | 'normal' | 'high' = 'normal'
        
        if (priceInGwei < 50) level = 'low'
        else if (priceInGwei > 100) level = 'high'

        setGasInfo({
          gasPrice: price,
          gasLevel: level,
        })
      }
    } catch (error) {
      console.warn('Error fetching gas price:', error)
    } finally {
      setIsLoading(false)
    }
  }, [publicClient])

  useEffect(() => {
    fetchGasPrice()
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchGasPrice, 30000)
    return () => clearInterval(interval)
  }, [fetchGasPrice])

  return { ...gasInfo, isLoading, refetch: fetchGasPrice }
}
