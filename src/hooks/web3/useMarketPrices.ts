import { useState, useEffect } from 'react'

export interface PriceData {
    usd: number
    usd_24h_change?: number
}

export interface MarketPrices {
    pol: PriceData | null
    sol: PriceData | null
    idToSymbol: Record<string, string>
}

const POLL_INTERVAL = 60000 // 1 minute

export const useMarketPrices = () => {
    const [prices, setPrices] = useState<MarketPrices>({
        pol: null,
        sol: null,
        idToSymbol: {
            'polygon-ecosystem-token': 'pol',
            'solana': 'sol'
        }
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const fetchPrices = async () => {
            try {
                // IDs for CoinGecko
                const symbols = 'polygon-ecosystem-token,solana'
                const response = await fetch(`/api/market/prices?action=prices&symbols=${symbols}`)

                if (!response.ok) throw new Error('Failed to fetch prices')

                const json = await response.json()

                if (json.success && json.data && isMounted) {
                    setPrices(prev => ({
                        ...prev,
                        pol: json.data['polygon-ecosystem-token'] || null,
                        sol: json.data['solana'] || null
                    }))
                    setLoading(false)
                }
            } catch (err) {
                console.error('[useMarketPrices] Error:', err)
                if (isMounted) {
                    setError('Failed to load prices')
                    setLoading(false)
                }
            }
        }

        fetchPrices()
        const interval = setInterval(fetchPrices, POLL_INTERVAL)

        return () => {
            isMounted = false
            clearInterval(interval)
        }
    }, [])

    return { prices, loading, error }
}
