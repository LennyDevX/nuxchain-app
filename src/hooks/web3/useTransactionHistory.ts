import { useState, useCallback, useEffect } from 'react'
import { useAccount, usePublicClient } from 'wagmi'

export interface Transaction {
  hash: string
  from: string
  to: string | null
  value: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  type: 'sent' | 'received' | 'contract'
}

const TX_CACHE: { [address: string]: Transaction[] } = {}

export function useTransactionHistory(limit: number = 3) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { address } = useAccount()
  const publicClient = usePublicClient()

  const fetchTransactions = useCallback(async () => {
    if (!address || !publicClient) return

    // Verificar cache
    if (address in TX_CACHE) {
      setTransactions(TX_CACHE[address].slice(0, limit))
      return
    }

    setIsLoading(true)
    try {
      // En Polygon, podemos usar el indexer o subgraph para obtener transacciones
      // Por ahora, usaremos una implementación simple que puede ser mejorada
      // con un subgraph o indexer como Covalent o Alchemy
      
      // Placeholder: Esta es una implementación básica
      // En producción, usar una API como Alchemy o Covalent
      const recentTxs: Transaction[] = [
        // Estructura de ejemplo, rellenar desde API real
      ]

      TX_CACHE[address] = recentTxs
      setTransactions(recentTxs.slice(0, limit))
    } catch (error) {
      console.warn('Error fetching transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [address, publicClient, limit])

  useEffect(() => {
    fetchTransactions()
    // Actualizar cada 15 segundos
    const interval = setInterval(fetchTransactions, 15000)
    return () => clearInterval(interval)
  }, [fetchTransactions])

  return { transactions, isLoading, refetch: fetchTransactions }
}

/**
 * Hook para monitorear una transacción específica
 */
export function useTransactionMonitor(txHash: string | null) {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending')
  const publicClient = usePublicClient()

  useEffect(() => {
    if (!txHash || !publicClient) return

    const monitor = async () => {
      try {
        const receipt = await publicClient.getTransactionReceipt?.({
          hash: txHash as `0x${string}`,
        })

        if (receipt) {
          setStatus(receipt.status === 'success' ? 'confirmed' : 'failed')
        }
      } catch (error) {
        console.warn('Error monitoring transaction:', error)
      }
    }

    monitor()
    const interval = setInterval(monitor, 5000)
    return () => clearInterval(interval)
  }, [txHash, publicClient])

  return { status }
}
