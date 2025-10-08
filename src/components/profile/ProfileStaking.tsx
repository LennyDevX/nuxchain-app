import React from 'react';
import { useAccount } from 'wagmi';
import { useUserStaking } from '../../hooks/staking/useUserStaking';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { useReadContract } from 'wagmi';
import SmartStakingABI from '../../abi/SmartStaking.json';
import { formatEther } from 'viem';

const ProfileStaking: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { totalStaked, pendingRewards, apy, activePositions, isLoading } = useUserStaking();
  const isMobile = useIsMobile();

  const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS_V2;

  // Get user deposits to check lockup periods
  const { data: userDeposits } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: SmartStakingABI.abi,
    functionName: 'getUserDeposits',
    args: [address],
    query: { enabled: !!address }
  });

  // Calculate available to withdraw considering lockup periods
  const calculateAvailableToWithdraw = () => {
    if (!userDeposits || !Array.isArray(userDeposits)) return { amount: '0', isLocked: false, daysRemaining: 0 };

    const now = Math.floor(Date.now() / 1000);
    let availableAmount = 0n;
    let hasLockedDeposits = false;
    let minDaysRemaining = 0;

    type Deposit = {
      amount: bigint;
      timestamp: number;
      lockupDuration: number;
    };

    for (const deposit of userDeposits as Deposit[]) {
      const lockupEnd = Number(deposit.timestamp) + Number(deposit.lockupDuration);
      const isLocked = now < lockupEnd;

      if (isLocked) {
        hasLockedDeposits = true;
        const daysLeft = Math.ceil((lockupEnd - now) / (60 * 60 * 24));
        if (minDaysRemaining === 0 || daysLeft < minDaysRemaining) {
          minDaysRemaining = daysLeft;
        }
      } else {
        availableAmount += deposit.amount;
      }
    }

    return {
      amount: formatEther(availableAmount),
      isLocked: hasLockedDeposits && availableAmount === 0n,
      daysRemaining: minDaysRemaining
    };
  };

  const withdrawalInfo = calculateAvailableToWithdraw();

  return (
    <div className="space-y-6">
      <header>
        <h1 className={`font-bold text-gradient ${
          isMobile ? 'text-2xl' : 'text-3xl'
        }`}>
          My Staking
        </h1>
        <p className={`text-gray-400 mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>Gestiona tus posiciones de staking</p>
      </header>

      {isConnected ? (
        <>
          {/* Stats Cards */}
          {isLoading ? (
            <div className="card-content text-center py-8">
              <LoadingSpinner />
              <p className="text-gray-400 mt-4">Loading staking data...</p>
            </div>
          ) : (
            <section className={`grid gap-4 ${
              isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            }`}>
              {/* Total Staked */}
              <div className={`card-stats ${isMobile ? 'p-3' : ''}`}>
                <h3 className={`font-semibold text-gray-400 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>Total Staked</h3>
                <p className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {parseFloat(totalStaked).toFixed(isMobile ? 2 : 4)} POL
                </p>
                <p className={`text-gray-500 mt-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  {activePositions} position{activePositions !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Rewards Earned */}
              <div className={`card-stats ${isMobile ? 'p-3' : ''}`}>
                <h3 className={`font-semibold text-gray-400 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>Rewards</h3>
                <p className={`font-bold text-green-400 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {parseFloat(pendingRewards).toFixed(isMobile ? 2 : 4)} POL
                </p>
                <p className={`text-gray-500 mt-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>Claimable</p>
              </div>

              {/* APY */}
              <div className={`card-stats ${isMobile ? 'p-3' : ''}`}>
                <h3 className={`font-semibold text-gray-400 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>APY</h3>
                <p className={`font-bold text-purple-400 ${isMobile ? 'text-lg' : 'text-2xl'}`}>{apy}%</p>
                <p className={`text-gray-500 mt-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>Annual Yield</p>
              </div>

              {/* Available to Withdraw - NEW */}
              <div className={`card-stats ${isMobile ? 'p-3' : ''} ${
                withdrawalInfo.isLocked ? 'border-orange-500/30' : 'border-green-500/30'
              }`}>
                <h3 className={`font-semibold text-gray-400 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Available
                </h3>
                <p className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'} ${
                  withdrawalInfo.isLocked ? 'text-orange-400' : 'text-green-400'
                }`}>
                  {withdrawalInfo.isLocked ? '🔒 Locked' : `${parseFloat(withdrawalInfo.amount).toFixed(isMobile ? 2 : 4)} POL`}
                </p>
                <p className={`mt-1 ${isMobile ? 'text-xs' : 'text-xs'} ${
                  withdrawalInfo.isLocked ? 'text-orange-400' : 'text-green-500'
                }`}>
                  {withdrawalInfo.isLocked 
                    ? `${withdrawalInfo.daysRemaining}d remaining` 
                    : 'Ready now ✓'}
                </p>
              </div>
            </section>
          )}

          {/* Active Positions */}
          <section className="card-content">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Active Positions</h2>
              <a href="/staking" className="btn-secondary text-sm">
                Start Staking
              </a>
            </div>
            
            {activePositions > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 text-center">
                  You have {activePositions} active staking position{activePositions !== 1 ? 's' : ''}. 
                  Visit the <a href="/staking" className="text-purple-400 hover:underline">Staking page</a> to manage them.
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-600/20 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Active Positions</h3>
                <p className="text-gray-400 text-sm">Start staking to earn rewards</p>
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="card-content text-center py-16">
          <p className="text-gray-400">Connect your wallet to view your staking positions</p>
        </div>
      )}
    </div>
  );
};

export default ProfileStaking;
