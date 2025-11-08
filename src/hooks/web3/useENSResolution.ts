import { useState, useCallback, useEffect } from 'react'
import { usePublicClient } from 'wagmi'

interface ENSCache {
  [address: string]: string | null;
}

const ENS_CACHE: ENSCache = {}

export function useENSResolution(address: string | undefined) {
  const [ensName, setEnsName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const publicClient = usePublicClient()

  const resolveENS = useCallback(async () => {
    if (!address || !publicClient) return

    // Verificar cache primero
    if (address in ENS_CACHE) {
      setEnsName(ENS_CACHE[address])
      return
    }

    setIsLoading(true)
    try {
      // Usar getEnsAddress para resolver ENS name desde address
      const name = await publicClient.getEnsName?.({
        address: address as `0x${string}`,
      })
      
      // Guardar en cache
      ENS_CACHE[address] = name || null
      setEnsName(name || null)
    } catch (error) {
      console.warn('Error resolving ENS:', error)
      ENS_CACHE[address] = null
      setEnsName(null)
    } finally {
      setIsLoading(false)
    }
  }, [address, publicClient])

  useEffect(() => {
    resolveENS()
  }, [resolveENS])

  return { ensName, isLoading }
}
