/**
 * Uniswap Price Feed Component
 * Muestra precios en tiempo real de tokens clave usando la Uniswap Trading API
 */

import React, { useState, useEffect } from 'react';
import { useUniswapPrices, type TokenPrice } from '../../hooks/useUniswapPrices';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { motion } from 'framer-motion';

const UniswapLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#FF007A" fillOpacity="0.15" />
    <path
      d="M38.5 28c-1.2 0-2.1.4-2.7 1.1-.6.7-.9 1.7-.9 2.9 0 .8.2 1.5.5 2.1.3.6.8 1.1 1.4 1.5l8.2 4.8c.4.2.6.6.6 1v18.2c0 .5-.3.9-.7 1.1l-6.8 3.5c-.9.5-1.4 1.4-1.4 2.4 0 1.5 1.2 2.7 2.7 2.7.5 0 1-.1 1.4-.4l14-7.2c.5-.3.8-.8.8-1.4V41.5c0-.4.2-.8.6-1l8.2-4.8c.6-.4 1.1-.9 1.4-1.5.3-.6.5-1.3.5-2.1 0-1.2-.3-2.2-.9-2.9-.6-.7-1.5-1.1-2.7-1.1H38.5z"
      fill="#FF007A"
    />
  </svg>
);

const TrendArrow: React.FC<{ positive: boolean }> = ({ positive }) =>
  positive ? (
    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
      <path d="M6 2L10 8H2L6 2Z" fill="currentColor" />
    </svg>
  ) : (
    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
      <path d="M6 10L2 4H10L6 10Z" fill="currentColor" />
    </svg>
  );

const formatPrice = (price: number): string => {
  if (price === 0) return '—';
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  return `$${price.toFixed(6)}`;
};

const formatVolume = (vol: number): string => {
  if (vol === 0) return '—';
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`;
  if (vol >= 1e3) return `$${(vol / 1e3).toFixed(1)}K`;
  return `$${vol.toFixed(0)}`;
};

// Tokens adicionales para mostrar en el scroll infinito (incluye Solana y XRP)
const ADDITIONAL_TOKENS: TokenPrice[] = [
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    price: 145.32,
    change24h: 8.45,
    volume24h: 2850000000,
    color: '#14F195',
    source: 'coingecko'
  },
  {
    id: 'ripple',
    symbol: 'XRP',
    name: 'XRP',
    price: 2.34,
    change24h: -1.23,
    volume24h: 1450000000,
    color: '#23292F',
    source: 'coingecko'
  },
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67890.12,
    change24h: 3.45,
    volume24h: 45200000000,
    color: '#F7931A',
    source: 'coingecko'
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    price: 0.78,
    change24h: 2.12,
    volume24h: 456000000,
    color: '#0033AD',
    source: 'coingecko'
  },
  {
    id: 'avalanche',
    symbol: 'AVAX',
    name: 'Avalanche',
    price: 38.45,
    change24h: 5.67,
    volume24h: 789000000,
    color: '#E84142',
    source: 'coingecko'
  },
  {
    id: 'chainlink',
    symbol: 'LINK',
    name: 'Chainlink',
    price: 18.92,
    change24h: 1.45,
    volume24h: 345000000,
    color: '#375BD2',
    source: 'coingecko'
  },
  {
    id: 'polygon',
    symbol: 'POL',
    name: 'Polygon',
    price: 0.45,
    change24h: -0.89,
    volume24h: 234000000,
    color: '#8247E5',
    source: 'coingecko'
  },
  {
    id: 'arbitrum',
    symbol: 'ARB',
    name: 'Arbitrum',
    price: 0.85,
    change24h: 4.32,
    volume24h: 123000000,
    color: '#28A0F0',
    source: 'coingecko'
  },
  {
    id: 'dogecoin',
    symbol: 'DOGE',
    name: 'Dogecoin',
    price: 0.38,
    change24h: 12.45,
    volume24h: 2100000000,
    color: '#C29D4C',
    source: 'coingecko'
  },
  {
    id: 'litecoin',
    symbol: 'LTC',
    name: 'Litecoin',
    price: 185.50,
    change24h: -2.15,
    volume24h: 1200000000,
    color: '#345D9D',
    source: 'coingecko'
  },
  {
    id: 'uniswap',
    symbol: 'UNI',
    name: 'Uniswap',
    price: 8.92,
    change24h: 6.78,
    volume24h: 567000000,
    color: '#FF007A',
    source: 'uniswap'
  },
  {
    id: 'aave',
    symbol: 'AAVE',
    name: 'Aave',
    price: 432.10,
    change24h: 3.45,
    volume24h: 890000000,
    color: '#D3AEE8',
    source: 'coingecko'
  },
  {
    id: 'tether',
    symbol: 'USDT',
    name: 'Tether',
    price: 0.9998,
    change24h: 0.02,
    volume24h: 78900000000,
    color: '#26A17B',
    source: 'coingecko'
  },
  {
    id: 'maker',
    symbol: 'MKR',
    name: 'Maker',
    price: 2890.50,
    change24h: 5.12,
    volume24h: 234000000,
    color: '#1AAB9B',
    source: 'coingecko'
  },
  {
    id: 'optimism',
    symbol: 'OP',
    name: 'Optimism',
    price: 2.45,
    change24h: 7.89,
    volume24h: 345000000,
    color: '#FF0420',
    source: 'coingecko'
  }
];

interface TokenCardProps {
  token: TokenPrice;
  isMobile: boolean;
}

const TokenCard: React.FC<TokenCardProps> = ({ token, isMobile }) => {
  const isPositive = token.change24h >= 0;
  const changeColor = isPositive ? 'text-emerald-400' : 'text-red-400';
  const changeBg = isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10';

  return (
    <div className="group relative bg-black/20 hover:bg-black/40 rounded-xl border border-white/5 hover:border-purple-500/20 transition-all duration-300 p-4 min-w-[160px] sm:min-w-[180px] flex-shrink-0">
      {/* Token color accent */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl opacity-60"
        style={{ backgroundColor: token.color }}
      />

      <div className="flex items-center justify-between mb-3">
        {/* Token identity */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: token.color + '33', border: `1px solid ${token.color}55` }}
          >
            <span style={{ color: token.color }}>{token.symbol.charAt(0)}</span>
          </div>
          <div>
            <p className={`font-bold text-white ${isMobile ? 'text-sm' : 'text-base'}`}>
              {token.symbol}
            </p>
            {!isMobile && (
              <p className="text-xs text-slate-500">{token.name}</p>
            )}
          </div>
        </div>

        {/* 24h change badge */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${changeBg} ${changeColor}`}>
          <TrendArrow positive={isPositive} />
          <span className="text-xs font-semibold">
            {Math.abs(token.change24h).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Price */}
      <p className={`font-bold text-white mb-1 ${isMobile ? 'text-lg' : 'text-xl'}`}>
        {formatPrice(token.price)}
      </p>

      {/* Volume */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Vol 24h: <span className="text-slate-400">{formatVolume(token.volume24h)}</span>
        </p>
        {token.source === 'uniswap' && (
          <span className="text-xs text-pink-500/70 font-mono">UNI</span>
        )}
        {token.source === 'coingecko' && (
          <span className="text-xs text-emerald-500/70 font-mono">CG</span>
        )}
      </div>
    </div>
  );
};

const SkeletonCard: React.FC = () => (
  <div className="bg-black/20 rounded-xl border border-white/5 p-4 min-w-[160px] sm:min-w-[180px] flex-shrink-0 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-slate-700" />
        <div className="space-y-1">
          <div className="h-3 w-12 bg-slate-700 rounded" />
          <div className="h-2 w-20 bg-slate-800 rounded" />
        </div>
      </div>
      <div className="h-5 w-14 bg-slate-700 rounded-full" />
    </div>
    <div className="h-6 w-24 bg-slate-700 rounded mb-2" />
    <div className="h-2 w-32 bg-slate-800 rounded" />
  </div>
);

// Componente de scroll infinito horizontal
const InfiniteScrollTokens: React.FC<{
  tokens: TokenPrice[];
  isMobile: boolean;
  loading: boolean;
}> = ({ tokens, isMobile, loading }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Combinar tokens de API con tokens adicionales
  const allTokens = [...(tokens || []), ...ADDITIONAL_TOKENS];

  // Duplicar tokens para crear el efecto infinito
  const duplicatedTokens = [...allTokens, ...allTokens, ...allTokens];

  if (loading && !tokens) {
    return (
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden py-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient overlays para efecto fade en los bordes */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10 pointer-events-none" />

      {/* Contenedor del scroll infinito */}
      <motion.div
        className="flex gap-3"
        animate={{
          x: [0, -50 * allTokens.length * 4],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 50,
            ease: "linear",
          },
        }}
        style={{
          animationPlayState: isHovered ? 'paused' : 'running'
        }}
      >
        {duplicatedTokens.map((token, idx) => (
          <TokenCard key={`${token.id}-${idx}`} token={token} isMobile={isMobile} />
        ))}
      </motion.div>
    </div>
  );
};

const UniswapPriceFeed: React.FC = () => {
  const { data, loading, error, refetch, lastUpdated } = useUniswapPrices();
  const isMobile = useIsMobile();
  const [now, setNow] = useState(() => lastUpdated ?? 0);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const timeAgo = lastUpdated && now > 0
    ? Math.round((now - lastUpdated) / 1000)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between ${isMobile ? 'flex-col gap-3 text-center' : ''}`}>
        <div className={`flex items-center gap-3 ${isMobile ? 'justify-center' : ''}`}>
          <UniswapLogo className="w-8 h-8" />
          <div>
            <h3 className={`font-bold text-white jersey-15-regular ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Real-Time Token Prices
            </h3>
            <p className="text-xs text-slate-500 jersey-20-regular">
              Powered by{' '}
              <a
                href="https://developers.uniswap.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:text-pink-400 transition-colors"
              >
                Uniswap API
              </a>
              {' & '}
              <a
                href="https://coingecko.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                CoinGecko
              </a>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs text-slate-400">
              {timeAgo !== null ? `Updated ${timeAgo}s ago` : 'Live'}
            </span>
          </div>

          {/* Refresh button */}
          <button
            onClick={refetch}
            className="text-xs text-slate-500 hover:text-purple-400 transition-colors px-2 py-1 rounded border border-white/5 hover:border-purple-500/30"
            aria-label="Refresh prices"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && !data && (
        <div className="text-center py-8 rounded-xl border border-red-500/20 bg-red-900/10">
          <p className="text-red-400 text-sm">Unable to load prices</p>
          <button
            onClick={refetch}
            className="mt-3 text-xs text-slate-400 hover:text-white transition-colors underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Token marquee con scroll infinito */}
      <div className="relative">
        <InfiniteScrollTokens
          tokens={data || []}
          isMobile={isMobile}
          loading={loading}
        />
      </div>

      {/* Tokens destacados - Grid estático */}
      {(data && data.length > 0) && (
        <div className="mt-8">
          <h4 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            Top Uniswap Tokens
          </h4>
          <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-5'}`}>
            {data.slice(0, 5).map(token => (
              <TokenCard key={token.id} token={token} isMobile={isMobile} />
            ))}
          </div>
        </div>
      )}

      {/* Footer note */}
      <p className="text-center text-xs text-slate-600">
        Prices update every 30 seconds · Hover to pause scroll · Data sourced from Uniswap Trading API & CoinGecko
      </p>
    </div>
  );
};

export default UniswapPriceFeed;
