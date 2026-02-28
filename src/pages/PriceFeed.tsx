import React from 'react';
import { Link } from 'react-router-dom';
import UniswapPriceFeed from '../components/labs/UniswapPriceFeed';
import { useIsMobile } from '../hooks/mobile/useIsMobile';

const PriceFeedPage: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4 py-6 pb-32' : 'px-4 sm:px-6 lg:px-8 py-12'}`}>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-slate-500">
          <Link to="/labs" className="hover:text-purple-400 transition-colors">
            Labs
          </Link>
          <span>/</span>
          <span className="text-slate-300">Live Price Feed</span>
        </div>

        {/* Header */}
        <div className={`mb-10 ${isMobile ? 'text-center' : ''}`}>
          <div className="flex items-center gap-3 mb-3 justify-center">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <span className="text-xs font-semibold tracking-widest text-pink-400 uppercase bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
              Powered by Uniswap API
            </span>
          </div>
          <h1 className={`font-bold text-gradient jersey-15-regular ${isMobile ? 'text-4xl mb-3' : 'text-5xl md:text-6xl mb-4'} text-center`}>
            Live Price Feed
          </h1>
          <p className={`text-slate-400 max-w-2xl mx-auto jersey-20-regular text-center ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            Real-time token prices sourced directly from the Uniswap Trading API. Updates every 30 seconds.
          </p>
        </div>

        {/* Main Price Feed */}
        <div className={`card-unified ${isMobile ? 'p-4' : 'p-8'} mb-8`}>
          <UniswapPriceFeed />
        </div>

        {/* Info Cards */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} mb-8`}>
          <div className="bg-black/20 rounded-xl border border-white/5 p-5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-1 text-sm">30s Refresh Rate</h3>
            <p className="text-slate-500 text-xs">Prices auto-update every 30 seconds to stay current with market conditions.</p>
          </div>

          <div className="bg-black/20 rounded-xl border border-white/5 p-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-1 text-sm">Secure Backend Proxy</h3>
            <p className="text-slate-500 text-xs">API key stays server-side. Your browser never touches the Uniswap API directly.</p>
          </div>

          <div className="bg-black/20 rounded-xl border border-white/5 p-5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-1 text-sm">Dual Source</h3>
            <p className="text-slate-500 text-xs">Prices from Uniswap Trading API. Volume & 24h change from CoinGecko as fallback.</p>
          </div>
        </div>

        {/* CTA — Swap coming soon */}
        <div className="card-unified p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/5 via-purple-600/5 to-blue-600/5 pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-block text-xs font-semibold tracking-widest text-purple-400 uppercase bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 mb-4">
              Coming Soon
            </span>
            <h2 className={`font-bold jersey-15-regular mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Swap directly from NuxChain
            </h2>
            <p className="text-slate-400 jersey-20-regular text-sm max-w-lg mx-auto mb-5">
              We're integrating the Uniswap Trading API to let you swap tokens without leaving the platform — with an optional interface fee that funds NuxChain development.
            </p>
            <Link
              to="/labs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-sm font-medium transition-all duration-200"
            >
              ← Back to Labs
            </Link>
          </div>
        </div>

        {/* Watermark */}
        <div className="text-center mt-12 opacity-40 hover:opacity-60 transition-opacity">
          <p className="text-sm text-slate-500 jersey-20-regular">
            Powered by <span className="text-pink-400 font-semibold">Uniswap</span> <span className="text-pink-500">❤️</span>
          </p>
        </div>

      </div>
    </>
  );
};

export default PriceFeedPage;
