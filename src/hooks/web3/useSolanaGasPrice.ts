import { useQuery } from '@tanstack/react-query'
import { Connection } from '@solana/web3.js'
import { SOLANA_RPC_FALLBACKS, DEFAULT_SOLANA_NETWORK } from '../../constants/solana'

interface SolanaGasInfo {
    prioritizationFee: number | null
    gasLevel: 'low' | 'normal' | 'high'
}

export function useSolanaGasPrice(network = DEFAULT_SOLANA_NETWORK) {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['solanaGasPrice', network],
        queryFn: async () => {
            const rpcUrl = SOLANA_RPC_FALLBACKS[network][0] // Usamos el fallback principal
            const connection = new Connection(rpcUrl, 'processed')

            try {
                const fees = await connection.getRecentPrioritizationFees()
                if (!fees || fees.length === 0) return { prioritizationFee: 0, gasLevel: 'low' }

                // Calculamos el promedio de los fees recientes (micro-lamports)
                const avgFee = fees.reduce((acc, f) => acc + f.prioritizationFee, 0) / fees.length

                // Categorizamos (valores orientativos para congestion)
                let level: 'low' | 'normal' | 'high' = 'normal'
                if (avgFee < 100) level = 'low'
                else if (avgFee > 5000) level = 'high'

                return {
                    prioritizationFee: avgFee,
                    gasLevel: level,
                } as SolanaGasInfo
            } catch (err) {
                console.warn('[useSolanaGasPrice] Error fetching fees:', err)
                return { prioritizationFee: null, gasLevel: 'normal' }
            }
        },
        staleTime: 60000, // 1 minute
        refetchInterval: 60000,
    })

    return {
        prioritizationFee: data?.prioritizationFee ?? null,
        gasLevel: data?.gasLevel ?? 'normal',
        isLoading,
        refetch
    }
}
