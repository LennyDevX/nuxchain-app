import CountdownTimer from '../ui/CountdownTimer';
import NuxCoinDisplay from './NuxCoinDisplay';

interface AirdropHeaderProps {
  tokensPerUser: number;
  airdropEndDate: Date;
}

function AirdropHeader({ tokensPerUser, airdropEndDate }: AirdropHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center mb-6 sm:mb-10 animate-fadeIn">
      {/* 1. NUX Coin Display (Smaller on Mobile) */}
      <div className="mb-4 sm:mb-6 transform hover:scale-110 transition-transform duration-500 scale-75 sm:scale-100">
        <NuxCoinDisplay size="xl" className="nux-coin-container drop-shadow-[0_0_35px_rgba(168,85,247,0.4)]" />
      </div>

      {/* 2. Title */}
      <h1 className="text-3xl sm:text-5xl lg:text-8xl font-black bg-gradient-to-b from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-6 tracking-tighter italic">
        $NUX Airdrop
      </h1>

      {/* 3. Compact Info Pills */}
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center mb-4 sm:mb-6 max-w-4xl">
        <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 sm:px-5 py-1.5 sm:py-2">
          <span className="text-purple-400 text-xs sm:text-sm font-bold">SOLANA</span>
        </div>

        <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 sm:px-5 py-1.5 sm:py-2">
          <span className="text-blue-400 text-xs sm:text-sm font-bold">Pre-sale 18 Feb</span>
        </div>
      </div>

      {/* 4. Compact Timer */}
      <div className="w-full max-w-md transform scale-75 sm:scale-100 -my-6 sm:my-0">
         <CountdownTimer targetDate={airdropEndDate} compact={true} />
      </div>

      <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-gray-400 max-w-2xl font-light">
        Get <span className="text-white font-semibold">{tokensPerUser.toLocaleString()} NUX</span>
      </p>
    </div>
  );
}

export default AirdropHeader;