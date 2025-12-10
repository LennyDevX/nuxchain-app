/**
 * CoinGecko Market Data Service
 * Obtiene datos de mercado públicos usando CoinGecko API (sin geo-restricciones)
 */
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
// ============================================================================
// MARKET PRICE DATA
// ============================================================================
/**
 * Mapea símbolos de trading a IDs de CoinGecko
 */
function getCoinGeckoId(symbol) {
    const symbolMap = {
        'BTCUSDT': 'bitcoin',
        'ETHUSDT': 'ethereum',
        'BNBUSDT': 'binancecoin',
        'ADAUSDT': 'cardano',
        'SOLUSDT': 'solana',
        'XRPUSDT': 'ripple',
        'DOTUSDT': 'polkadot',
        'DOGEUSDT': 'dogecoin',
        'MATICUSDT': 'matic-network',
        'AVAXUSDT': 'avalanche-2',
        'LINKUSDT': 'chainlink',
        'UNIUSDT': 'uniswap',
        'ATOMUSDT': 'cosmos',
        'LTCUSDT': 'litecoin',
        'NEARUSDT': 'near',
        'ALGOUSDT': 'algorand',
        'FTMUSDT': 'fantom',
    };
    return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase().replace('usdt', '');
}
/**
 * Obtiene el precio actual de un símbolo usando CoinGecko
 */
export async function getSymbolPrice(symbol) {
    const coinId = getCoinGeckoId(symbol);
    const response = await fetch(`${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${coinId}&sparkline=false`, { method: 'GET' });
    if (!response.ok) {
        throw new Error(`Failed to fetch price for ${symbol}`);
    }
    const data = await response.json();
    if (data.length === 0) {
        throw new Error(`Coin not found: ${symbol}`);
    }
    const coin = data[0];
    return {
        symbol: `${coin.symbol.toUpperCase()}/USDT`,
        price: coin.current_price,
        change24h: coin.price_change_24h,
        changePercent24h: coin.price_change_percentage_24h,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        volume24h: coin.total_volume,
        quoteVolume24h: coin.market_cap
    };
}
/**
 * Obtiene precios de múltiples símbolos usando CoinGecko
 */
export async function getMultiplePrices(symbols) {
    const coinIds = symbols.map(s => getCoinGeckoId(s)).join(',');
    const response = await fetch(`${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${coinIds}&sparkline=false`, { method: 'GET' });
    if (!response.ok) {
        throw new Error('Failed to fetch prices');
    }
    const data = await response.json();
    return data.map(coin => ({
        symbol: `${coin.symbol.toUpperCase()}/USDT`,
        price: coin.current_price,
        change24h: coin.price_change_24h,
        changePercent24h: coin.price_change_percentage_24h,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        volume24h: coin.total_volume,
        quoteVolume24h: coin.market_cap
    }));
}
/**
 * Obtiene los pares más populares (predefinidos)
 * CoinGecko no tiene un concepto directo de "pares de trading"
 */
export async function getAllTradingPairs() {
    // Retornamos los pares más populares en formato SYMBOL+USDT
    return [
        'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT',
        'SOLUSDT', 'DOTUSDT', 'DOGEUSDT', 'MATICUSDT', 'AVAXUSDT',
        'LINKUSDT', 'UNIUSDT', 'ATOMUSDT', 'LTCUSDT', 'NEARUSDT',
        'ALGOUSDT', 'FTMUSDT'
    ];
}
// ============================================================================
// ORDER BOOK DATA
// ============================================================================
/**
 * Obtiene el order book (profundidad del mercado)
 * NOTA: CoinGecko no ofrece order book data directamente
 * Se mantiene la interfaz pero retorna datos simulados
 */
export async function getOrderBook(symbol) {
    console.warn('CoinGecko does not provide order book data. Returning mock data.');
    return {
        symbol,
        bids: [],
        asks: [],
        timestamp: Date.now()
    };
}
/**
 * Obtiene datos de candlesticks para gráficos
 * NOTA: CoinGecko ofrece datos históricos pero en formato diferente
 * Esta función está adaptada para usar market_chart de CoinGecko
 * Los parámetros startTime y endTime no son soportados por CoinGecko
 */
export async function getKlines(symbol, interval = '1d', limit = 100) {
    const coinId = getCoinGeckoId(symbol);
    // Convertir intervalo a días
    const days = interval === '1d' ? limit : Math.ceil(limit / 24);
    const response = await fetch(`${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`, { method: 'GET' });
    if (!response.ok) {
        throw new Error(`Failed to fetch market chart for ${symbol}`);
    }
    const data = await response.json();
    // Convertir datos de CoinGecko a formato Kline
    return data.prices.slice(0, limit).map((price, index) => {
        const timestamp = price[0];
        const value = price[1].toString();
        return {
            openTime: timestamp,
            open: value,
            high: value,
            low: value,
            close: value,
            volume: data.total_volumes[index]?.[1]?.toString() || '0',
            closeTime: timestamp + 86400000, // +1 day
            quoteAssetVolume: data.total_volumes[index]?.[1]?.toString() || '0'
        };
    });
}
// ============================================================================
// TOP MOVERS
// ============================================================================
/**
 * Obtiene los top gainers (criptos que más subieron) usando CoinGecko
 */
export async function getTopGainers(limit = 10) {
    // Obtener top 100 para tener suficientes opciones con cambios positivos
    const response = await fetch(`${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=price_change_percentage_24h_desc&per_page=100&page=1&sparkline=false`, { method: 'GET' });
    if (!response.ok) {
        throw new Error('Failed to fetch top gainers');
    }
    const data = await response.json();
    // Filtrar solo las que tienen cambio positivo y tomar el límite requerido
    return data
        .filter(coin => coin.price_change_percentage_24h > 0)
        .slice(0, limit)
        .map(coin => ({
        symbol: `${coin.symbol.toUpperCase()}/USDT`,
        price: coin.current_price,
        change24h: coin.price_change_24h,
        changePercent24h: coin.price_change_percentage_24h,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        volume24h: coin.total_volume,
        quoteVolume24h: coin.market_cap
    }));
}
/**
 * Obtiene los top losers (criptos que más bajaron) usando CoinGecko
 */
export async function getTopLosers(limit = 10) {
    // Obtener desde el final (los que más bajaron) y filtrar negativos
    const response = await fetch(`${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=price_change_percentage_24h_asc&per_page=100&page=1&sparkline=false`, { method: 'GET' });
    if (!response.ok) {
        throw new Error('Failed to fetch top losers');
    }
    const data = await response.json();
    // Filtrar solo las que tienen cambio negativo y tomar el límite requerido
    return data
        .filter(coin => coin.price_change_percentage_24h < 0)
        .slice(0, limit)
        .map(coin => ({
        symbol: `${coin.symbol.toUpperCase()}/USDT`,
        price: coin.current_price,
        change24h: coin.price_change_24h,
        changePercent24h: coin.price_change_percentage_24h,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        volume24h: coin.total_volume,
        quoteVolume24h: coin.market_cap
    }));
}
/**
 * Obtiene los pares con más volumen usando CoinGecko
 */
export async function getHighestVolume(limit = 10) {
    const response = await fetch(`${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=volume_desc&per_page=${limit}&page=1&sparkline=false`, { method: 'GET' });
    if (!response.ok) {
        throw new Error('Failed to fetch highest volume');
    }
    const data = await response.json();
    return data.map(coin => ({
        symbol: `${coin.symbol.toUpperCase()}/USDT`,
        price: coin.current_price,
        change24h: coin.price_change_24h,
        changePercent24h: coin.price_change_percentage_24h,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        volume24h: coin.total_volume,
        quoteVolume24h: coin.market_cap
    }));
}
export default {
    getSymbolPrice,
    getMultiplePrices,
    getAllTradingPairs,
    getOrderBook,
    getKlines,
    getTopGainers,
    getTopLosers,
    getHighestVolume
};
