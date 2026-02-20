import { memo } from 'react';
import { formatEther } from 'viem';

interface ClaimTabProps {
  pendingRewards: bigint | undefined;
  userStaked: bigint | undefined;
  totalRewardsClaimed: bigint | undefined;
  isLoadingClaimed: boolean;
  isPending: boolean;
  isConfirming: boolean;
  onClaim: () => void;
}

const ClaimTab = memo(({
  pendingRewards,
  userStaked,
  totalRewardsClaimed,
  isLoadingClaimed,
  isPending,
  isConfirming,
  onClaim,
}: ClaimTabProps) => {
  return (
    <div className="space-y-6">
      {/* Pending Rewards Section */}
      <div className="space-y-2">
        <p className="jersey-15-regular text-white/80 text-sm lg:text-base font-medium">Available to Claim</p>
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4">
          <p className="jersey-20-regular text-3xl lg:text-4xl font-bold text-white mb-1">
            {pendingRewards ? `${parseFloat(formatEther(pendingRewards)).toFixed(6)} POL` : '0 POL'}
          </p>
          <p className="jersey-20-regular text-white/60 text-xs lg:text-sm">
            {pendingRewards && pendingRewards > 0n
              ? 'These rewards are ready to be claimed and transferred to your wallet'
              : 'No pending rewards at this moment. Keep staking to earn more!'
            }
          </p>
        </div>
      </div>

      {/* Total Claimed Summary */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Rewards Claimed */}
        <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="jersey-15-regular text-white/70 text-xs lg:text-sm font-semibold">💎 Total Claimed</p>
            <div className="flex items-center gap-1">
              {isLoadingClaimed && (
                <svg className="animate-spin h-3 w-3 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </div>
          </div>
          <p className="jersey-20-regular text-xl lg:text-2xl font-bold text-purple-400 mb-1">
            {totalRewardsClaimed && totalRewardsClaimed > 0n
              ? `${parseFloat(formatEther(totalRewardsClaimed)).toFixed(6)} POL`
              : '0.000000 POL'}
          </p>
          <p className="jersey-20-regular text-white/50 text-xs lg:text-sm">
            {isLoadingClaimed
              ? 'Loading from contract...'
              : totalRewardsClaimed && totalRewardsClaimed > 0n
                ? 'Total rewards withdrawn since inception'
                : 'No rewards claimed yet. Stake and earn!'}
          </p>
        </div>

        {/* Total Staked */}
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg p-4">
          <p className="jersey-15-regular text-white/70 text-xs lg:text-sm font-semibold mb-2">💰 Total Staked</p>
          <p className="jersey-20-regular text-xl lg:text-2xl font-bold text-cyan-400 mb-1">
            {userStaked ? `${parseFloat(formatEther(userStaked)).toFixed(6)} POL` : '0 POL'}
          </p>
          <p className="jersey-20-regular text-white/50 text-xs lg:text-sm">
            Your current stake
          </p>
        </div>
      </div>

      {/* Information Section */}
      <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
        <p className="jersey-15-regular text-blue-300 text-sm lg:text-base leading-relaxed">
          <strong>ℹ️ How it works:</strong>
        </p>
        <ul className="jersey-20-regular text-blue-200/70 text-xs lg:text-sm mt-2 space-y-1 ml-4 list-disc">
          <li>Claiming rewards does NOT affect your staked amount</li>
          <li>Claimed rewards go directly to your wallet</li>
          <li>You can claim multiple times as rewards accumulate</li>
          <li>Rewards continue accruing after each claim</li>
        </ul>
      </div>

      {/* Claim Button */}
      <button
        onClick={onClaim}
        disabled={isPending || isConfirming || !pendingRewards || pendingRewards === 0n}
        className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-bold transition-all duration-200 hover:scale-105 shadow-lg jersey-20-regular text-lg lg:text-xl"
      >
        {isPending || isConfirming ? (
          <span className="flex items-center justify-center gap-2 jersey-20-regular">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : !pendingRewards || pendingRewards === 0n ? (
          <span className="jersey-20-regular">No Rewards to Claim</span>
        ) : (
          <span className="jersey-20-regular">Claim {parseFloat(formatEther(pendingRewards)).toFixed(6)} POL</span>
        )}
      </button>
    </div>
  );
});

ClaimTab.displayName = 'ClaimTab';
export default ClaimTab;
