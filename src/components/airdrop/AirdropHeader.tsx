import NuxCoinDisplay from './NuxCoinDisplay';

interface AirdropHeaderProps {
  tokensPerUser: number;
}

function AirdropHeader({ tokensPerUser }: AirdropHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center mb-6 sm:mb-10 animate-fadeIn">
      {/* NUX Coin Display */}
      <div className="mb-2 sm:mb-6 transform hover:scale-110 transition-transform duration-500 scale-[0.85] sm:scale-100">
        <NuxCoinDisplay size="xl" className="nux-coin-container drop-shadow-[0_0_45px_rgba(168,85,247,0.5)]" />
      </div>

      {/* Title */}
      <h1 className="jersey-15-regular text-4xl lg:text-5xl font-black bg-gradient-to-b from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-4 tracking-tighter italic drop-shadow-2xl">
        $NUX Airdrop
      </h1>

      {/* Info Pills */}
      <div className="flex flex-wrap gap-2.5 sm:gap-4 justify-center items-center px-4 py-2 mb-6 sm:mb-8 max-w-4xl">
        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 sm:px-6 py-2 backdrop-blur-md">
          <span className="jersey-20-regular text-purple-400 text-xl sm:text-2xl font-black tracking-widest">100M SUPPLY</span>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 sm:px-6 py-2 backdrop-blur-md">
          <span className="jersey-20-regular text-emerald-400 text-xl sm:text-2xl font-bold tracking-tight">3-PHASE VESTING</span>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 sm:px-6 py-2 backdrop-blur-md">
          <span className="jersey-20-regular text-amber-400 text-xl sm:text-2xl font-bold tracking-tight">🎁 AIRDROP: MAR 21</span>
        </div>
      </div>

      {/* Launch Roadmap — Objective-based */}
      <div className="w-full max-w-4xl mb-6 sm:mb-8">
        <p className="jersey-20-regular text-white/50 text-base sm:text-lg mb-4 uppercase tracking-widest">NUX launches when these objectives are met</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Objective 1: Whitelist */}
          <div className="relative p-4 sm:p-5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 backdrop-blur-md">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 rounded-full">
              <span className="jersey-15-regular text-white text-xs font-bold">STEP 1</span>
            </div>
            <div className="mt-4 text-center">
              <p className="jersey-15-regular text-amber-400 text-xl sm:text-2xl font-black">WHITELIST</p>
              <p className="jersey-20-regular text-white text-xl sm:text-2xl font-bold mt-2">0.000015 SOL</p>
              <p className="jersey-20-regular text-amber-300/70 text-sm mt-1">40% off • Min: 5K NUX</p>
              <p className="jersey-20-regular text-amber-200/60 text-xs mt-2">🎯 Whitelist quota must be filled</p>
            </div>
          </div>

          {/* Objective 2: Presale */}
          <div className="relative p-4 sm:p-5 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/40 backdrop-blur-md">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 rounded-full">
              <span className="jersey-15-regular text-white text-xs font-bold">STEP 2</span>
            </div>
            <div className="mt-4 text-center">
              <p className="jersey-15-regular text-blue-400 text-xl sm:text-2xl font-black">PRESALE</p>
              <p className="jersey-20-regular text-white text-xl sm:text-2xl font-bold mt-2">0.000025 SOL</p>
              <p className="jersey-20-regular text-blue-300/70 text-sm mt-1">Public • Min: 1K NUX</p>
              <p className="jersey-20-regular text-blue-200/60 text-xs mt-2">🎯 Presale objective must be reached</p>
            </div>
          </div>

          {/* Objective 3: LP */}
          <div className="relative p-4 sm:p-5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 backdrop-blur-md">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 rounded-full">
              <span className="jersey-15-regular text-white text-xs font-bold">STEP 3</span>
            </div>
            <div className="mt-4 text-center">
              <p className="jersey-15-regular text-emerald-400 text-xl sm:text-2xl font-black">LP / TGE</p>
              <p className="jersey-20-regular text-white text-xl sm:text-2xl font-bold mt-2">0.00004 SOL</p>
              <p className="jersey-20-regular text-emerald-300/70 text-sm mt-1">Market • Raydium LP</p>
              <p className="jersey-20-regular text-emerald-200/60 text-xs mt-2">🎯 SOL raised to seed the LP pool</p>
            </div>
          </div>
        </div>
      </div>

      {/* Airdrop Distribution Notice */}
      <div className="w-full max-w-3xl mb-6 sm:mb-8">
        <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-amber-500/20 border border-purple-500/30 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-amber-500/5 animate-pulse"></div>
          <div className="relative z-10 text-center">
            <p className="jersey-15-regular text-3xl sm:text-5xl text-gradient font-black">15,000,000 NUX</p>
            <p className="jersey-20-regular text-purple-300 text-lg sm:text-xl mt-1">🎁 Community Airdrop Pool (15% of supply)</p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <div className="flex items-center justify-center gap-2 bg-white/5 rounded-xl px-4 py-2.5 border border-white/10">
                <span className="text-lg">📅</span>
                <div className="text-left">
                  <p className="jersey-20-regular text-white/50 text-xs uppercase tracking-wide">Airdrop Starts</p>
                  <p className="jersey-15-regular text-white text-lg font-bold">March 21, 2026</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/5 rounded-xl px-4 py-2.5 border border-white/10">
                <span className="text-lg">💎</span>
                <div className="text-left">
                  <p className="jersey-20-regular text-white/50 text-xs uppercase tracking-wide">You receive</p>
                  <p className="jersey-15-regular text-white text-lg font-bold">{tokensPerUser.toLocaleString()} NUX</p>
                </div>
              </div>
            </div>
            <p className="jersey-20-regular text-white/50 text-sm mt-3">
              10K at TGE · 20K after 3 months · 10K after 6 months
            </p>
          </div>
        </div>
      </div>

      {/* Treasury Info */}
      <div className="w-full max-w-3xl">
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-md">
          <p className="jersey-15-regular text-purple-300 text-xl sm:text-2xl mb-3">🏛️ Treasury & Price Stability</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <p className="jersey-20-regular text-emerald-300/90 text-sm sm:text-base">✅ Unsold tokens fund community rewards</p>
            <p className="jersey-20-regular text-blue-300/90 text-sm sm:text-base">✅ Prevents sell pressure & dumps</p>
            <p className="jersey-20-regular text-amber-300/90 text-sm sm:text-base">✅ 50% of LP locked permanently</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AirdropHeader;