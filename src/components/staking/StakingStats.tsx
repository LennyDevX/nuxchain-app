import React from 'react';
import { formatEther } from 'viem';

interface StakingStatsProps {
  totalPoolBalance: bigint;
  uniqueUsersCount: bigint;
  totalDeposit: bigint;
  pendingRewards: bigint;
  contractVersion: bigint | undefined;
  contractBalance: bigint | undefined;
}

const StakingStats: React.FC<StakingStatsProps> = ({
  totalPoolBalance,
  uniqueUsersCount,
  totalDeposit,
  pendingRewards,
  contractVersion,
  contractBalance,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
      <div className="card-stats">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-xs font-medium truncate">Total Pool</span>
          <span className="text-lg">💰</span>
        </div>
        <div className="mb-1">
          <h3 className="text-xl font-bold text-white truncate">
            {totalPoolBalance ? formatEther(totalPoolBalance) : '0'}
          </h3>
        </div>
        <div className="text-white/40 text-xs truncate">
          POL staked
        </div>
      </div>

      <div className="card-stats">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-xs font-medium truncate">Active Users</span>
          <span className="text-lg">👥</span>
        </div>
        <div className="mb-1">
          <h3 className="text-xl font-bold text-white truncate">
            {uniqueUsersCount ? uniqueUsersCount.toString() : '0'}
          </h3>
        </div>
        <div className="text-white/40 text-xs truncate">
          Staking participants
        </div>
      </div>

      <div className="card-stats">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-xs font-medium truncate">Your Stake</span>
          <span className="text-lg">📈</span>
        </div>
        <div className="mb-1">
          <h3 className="text-xl font-bold text-white truncate">
            {totalDeposit ? parseFloat(formatEther(totalDeposit)).toFixed(4) : '0'}
          </h3>
        </div>
        <div className="text-white/40 text-xs truncate">
          POL deposited
        </div>
      </div>

      <div className="card-stats">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-xs font-medium truncate">Rewards</span>
          <span className="text-lg">🎁</span>
        </div>
        <div className="mb-1">
          <h3 className="text-xl font-bold text-white truncate">
            {pendingRewards ? parseFloat(formatEther(pendingRewards)).toFixed(6) : '0'}
          </h3>
        </div>
        <div className="text-white/40 text-xs truncate">
          Pending rewards
        </div>
      </div>

      <div className="card-stats">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-xs font-medium truncate">Contract Version</span>
          <span className="text-lg">📄</span>
        </div>
        <div className="mb-1">
          <h3 className="text-xl font-bold text-white truncate">
            {contractVersion ? `v${contractVersion.toString()}` : 'v0'}
          </h3>
        </div>
        <div className="text-white/40 text-xs truncate">
          Smart contract
        </div>
      </div>

      <div className="card-stats">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-xs font-medium truncate">Contract Balance</span>
          <span className="text-lg">🏦</span>
        </div>
        <div className="mb-1">
          <h3 className="text-xl font-bold text-white truncate">
            {contractBalance ? parseFloat(formatEther(contractBalance)).toFixed(4) : '0'}
          </h3>
        </div>
        <div className="text-white/40 text-xs truncate">
          Available funds
        </div>
      </div>
    </div>
  );
};

export default StakingStats;