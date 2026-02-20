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

      {/* 3. Compact Info Pills */}
      <div className="flex flex-wrap gap-2.5 sm:gap-4 justify-center items-center px-4 py-2 mb-6 sm:mb-10 max-w-4xl">
        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 sm:px-6 py-2 shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-md">
          <span className="jersey-20-regular text-purple-400 text-xl lg:text-xl font-black tracking-widest">SOLANA</span>
        </div>

        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 sm:px-6 py-2 shadow-[0_0_20px_rgba(59,130,246,0.15)] backdrop-blur-md">
          <span className="jersey-20-regular text-blue-400 text-xl lg:text-xl font-bold tracking-tight">PRE-SALE COMING SOON</span>
        </div>
      </div>

      {/* 4. Compact Timer */}
      <div className="w-full max-w-md transform scale-[0.85] sm:scale-100 my-4 sm:my-8 relative">
        <div className="absolute -inset-4 bg-purple-500/5 blur-3xl rounded-full -z-10 animate-pulse"></div>
        <CountdownTimer targetDate={airdropEndDate} compact={true} />
      </div>

      <p className="jersey-20-regular mt-6 sm:mt-10 text-2xl lg:text-4xl text-gray-400 max-w-2xl font-light tracking-wide">
        Get <span className="text-white font-bold mx-1">{tokensPerUser.toLocaleString()} NUX</span>
      </p>
    </div>
  );
}

export default AirdropHeader;