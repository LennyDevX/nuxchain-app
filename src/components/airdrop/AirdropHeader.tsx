import CountdownTimer from '../ui/CountdownTimer';
import NuxCoinDisplay from './NuxCoinDisplay';

interface AirdropHeaderProps {
  tokensPerUser: number;
  airdropEndDate: Date;
}

function AirdropHeader({ tokensPerUser, airdropEndDate }: AirdropHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center mb-6 sm:mb-10 animate-fadeIn">
      {/* 1. NUX Coin Display (Improved Mobile sizing) */}
      <div className="mb-2 sm:mb-6 transform hover:scale-110 transition-transform duration-500 scale-[0.85] sm:scale-100">
        <NuxCoinDisplay size="xl" className="nux-coin-container drop-shadow-[0_0_45px_rgba(168,85,247,0.5)]" />
      </div>

      {/* 2. Title */}
      <h1 className="jersey-15-regular text-4xl lg:text-5xl font-black bg-gradient-to-b from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-6 sm:mb-8 tracking-tighter italic drop-shadow-2xl">
        $NUX Airdrop
      </h1>

      {/* 3-Tier Launch Info Pills */}
      <div className="flex flex-wrap gap-2.5 sm:gap-4 justify-center items-center px-4 py-2 mb-6 sm:mb-10 max-w-4xl">
        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 sm:px-6 py-2 shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-md">
          <span className="jersey-20-regular text-purple-400 text-xl sm:text-2xl lg:text-3xl font-black tracking-widest">100M SUPPLY</span>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 sm:px-6 py-2 shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-md">
          <span className="jersey-20-regular text-emerald-400 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">3-PHASE VESTING</span>
        </div>

        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 sm:px-6 py-2 shadow-[0_0_20px_rgba(59,130,246,0.15)] backdrop-blur-md">
          <span className="jersey-20-regular text-blue-400 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">3-TIER LAUNCH</span>
        </div>
      </div>

      {/* 3-Tier Launch Details */}
      <div className="w-full max-w-4xl mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tier 1: Whitelist */}
          <div className="relative p-5 sm:p-6 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 backdrop-blur-md">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-amber-500 rounded-full">
              <span className="jersey-15-regular text-white text-base font-bold">TIER 1</span>
            </div>
            <div className="mt-3 text-center">
              <p className="jersey-15-regular text-amber-400 text-2xl sm:text-3xl font-black">WHITELIST</p>
              <p className="jersey-20-regular text-white text-3xl sm:text-4xl font-bold mt-2">0.000015 SOL</p>
              <p className="jersey-20-regular text-amber-300/70 text-base mt-2">40% off • Min: 5,000 NUX</p>
              <p className="jersey-20-regular text-white/50 text-xl mt-2">Mar 7</p>
            </div>
          </div>

          {/* Tier 2: Presale */}
          <div className="relative p-5 sm:p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/40 backdrop-blur-md">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-500 rounded-full">
              <span className="jersey-15-regular text-white text-xl font-bold">TIER 2</span>
            </div>
            <div className="mt-3 text-center">
              <p className="jersey-15-regular text-blue-400 text-2xl sm:text-3xl font-black">PRESALE</p>
              <p className="jersey-20-regular text-white text-3xl sm:text-4xl font-bold mt-2">0.000025 SOL</p>
              <p className="jersey-20-regular text-blue-300/70 text-xl mt-2">Public • Min: 1,000 NUX</p>
              <p className="jersey-20-regular text-white/50 text-xl mt-2">Mar 14</p>
            </div>
          </div>

          {/* Tier 3: LP/TGE */}
          <div className="relative p-5 sm:p-6 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 backdrop-blur-md">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-500 rounded-full">
              <span className="jersey-15-regular text-white text-base font-bold">TIER 3</span>
            </div>
            <div className="mt-3 text-center">
              <p className="jersey-15-regular text-emerald-400 text-2xl sm:text-3xl font-black">LP / TGE</p>
              <p className="jersey-20-regular text-white text-3xl sm:text-4xl font-bold mt-2">0.00004 SOL</p>
              <p className="jersey-20-regular text-emerald-300/70 text-xl mt-2">Market • Raydium LP</p>
              <p className="jersey-20-regular text-white/50 text-xl mt-2">Mar 21</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pool Banner */}
      <div className="w-full max-w-3xl mb-6 sm:mb-8">
        <div className="relative p-5 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 border border-amber-500/30 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
          <div className="relative z-10 text-center">
            
            <p className="jersey-15-regular text-4xl sm:text-6xl text-gradient font-black">
              20,000,000 NUX
            </p>
            <p className="jersey-20-regular text-amber-300 text-xl sm:text-2xl mb-1">🎁 Community Rewards Pool (100M Supply)</p>
            <p className="jersey-20-regular text-white/60 text-lg sm:text-xl mt-2">
              20% allocated for airdrop & ecosystem rewards
            </p>
            <div className="mt-4 p-3 rounded-xl bg-white/5 border border-amber-500/20">
              <p className="jersey-20-regular text-amber-200/80 text-base sm:text-lg">
                💎 <strong>Unsold tokens</strong> will fund additional rewards and be held by the treasury to ensure long-term price stability
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Get NUX & Treasury Info - Grid 2x2 Layout */}
      <div className="w-full max-w-5xl mt-6 sm:mt-10 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left: Get NUX Info with Timer */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-gray-500/10 to-purple-500/10 border border-purple-500/20 backdrop-blur-md">
          <p className="jersey-20-regular text-2xl sm:text-3xl lg:text-4xl text-gray-300 font-light tracking-wide mb-6">
            Get <span className="text-white font-bold">{tokensPerUser.toLocaleString()} NUX</span>
          </p>
          <div className="w-full transform scale-75 sm:scale-90 lg:scale-100 origin-top mb-6">
            <CountdownTimer targetDate={airdropEndDate} compact={true} />
          </div>
          <div className="space-y-2">
            <p className="jersey-20-regular text-lg sm:text-xl lg:text-2xl text-emerald-400/90">
              10K at TGE + 20K in 3 months + 10K in 6 months
            </p>
            <p className="jersey-20-regular text-base sm:text-lg lg:text-xl text-amber-400/90">
              + Exclusive Whitelist: Buy NUX at 0.000015 SOL (cheapest!)
            </p>
          </div>
        </div>

        {/* Right: Treasury & Stability Info */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-md">
          <p className="jersey-15-regular text-purple-300 text-2xl sm:text-3xl lg:text-4xl mb-3">🏛️ Treasury & Price Stability</p>
          <p className="jersey-20-regular text-white/70 text-base sm:text-lg leading-relaxed mb-3">
            All <strong className="text-white">unsold tokens</strong> will be:
          </p>
          <div className="space-y-2">
            <p className="jersey-20-regular text-emerald-300/90 text-base sm:text-lg">
              ✅ Pay additional rewards to the community
            </p>
            <p className="jersey-20-regular text-blue-300/90 text-base sm:text-lg">
              ✅ Support price stability and prevent dumps
            </p>
            <p className="jersey-20-regular text-amber-300/90 text-base sm:text-lg">
              ✅ Strategic sell pressure management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AirdropHeader;