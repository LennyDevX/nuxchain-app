import React, { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useUserStaking } from '../../hooks/staking/useUserStaking';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { useReadContract } from 'wagmi';
import SmartStakingABI from '../../abi/EnhancedSmartStaking.json';
import { formatEther } from 'viem';

const ProfileStaking: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { totalStaked, pendingRewards, activePositions, isLoading } = useUserStaking();
  const isMobile = useIsMobile();

  const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS;

  // Get user deposits to check lockup periods
  const { data: userDeposits } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: SmartStakingABI.abi,
    functionName: 'getUserDeposits',
    args: [address],
    query: { enabled: !!address }
  });

  // Calculate estimated APY based on pending rewards and total staked
  const estimatedAPY = useMemo(() => {
    try {
      const staked = parseFloat(totalStaked) || 0;
      const rewards = parseFloat(pendingRewards) || 0;
      
      // If there are active positions but no rewards yet, show default APY based on lockup
      if (staked === 0) return '0.00';
      
      // Check if there are deposits to determine the APY
      const deposits = (userDeposits as typeof userDeposits) || [];
      if (deposits && Array.isArray(deposits) && deposits.length > 0) {
        const lastDeposit = deposits[0];
        if (lastDeposit && 'lockupDuration' in lastDeposit) {
          const lockupDays = Number(lastDeposit.lockupDuration) / (24 * 60 * 60);
          
          // Return estimated APY based on lockup period
          const apyMap: { [key: number]: string } = {
            0: '87.60',     // Flexible
            30: '105.12',   // 30 days
            90: '140.16',   // 90 days
            180: '175.20',  // 180 days
            365: '262.80'   // 365 days
          };
          
          return apyMap[lockupDays] || '87.60';
        }
      }
      
      // If we have actual rewards, calculate from them
      if (rewards > 0) {
        const dailyRate = (rewards / staked) * 100;
        const annualAPY = dailyRate * 365;
        return Math.min(annualAPY, 262.80).toFixed(2);
      }
      
      // Default to flexible rate if nothing else applies
      return '87.60';
    } catch {
      return '0.00';
    }
  }, [totalStaked, pendingRewards, userDeposits]);

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
                  {parseFloat(pendingRewards).toFixed(6)} POL
                </p>
                <p className={`text-gray-500 mt-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>Claimable</p>
              </div>

              {/* APY */}
              <div className={`card-stats ${isMobile ? 'p-3' : ''}`}>
                <h3 className={`font-semibold text-gray-400 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>APY</h3>
                <p className={`font-bold text-purple-400 ${isMobile ? 'text-lg' : 'text-2xl'}`}>{estimatedAPY}%</p>
                <p className={`text-gray-500 mt-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>Annual Yield</p>
              </div>

              {/* Available to Withdraw */}
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

          {/* Active Positions - Minimalist CTA */}
          <section className="card-content border border-white/5 hover:border-purple-500/20 transition-all duration-300">
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-3">Manage Your Staking</h2>
                <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-400`}>
                  {activePositions > 0 
                    ? `View and manage your ${activePositions} active position${activePositions !== 1 ? 's' : ''}`
                    : 'Ready to start earning? Visit the staking dashboard'}
                </p>
              </div>

              <a
                href="/staking"
                className="w-full md:w-96 py-4 px-8 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-lg shadow-lg hover:shadow-purple-500/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Go to Staking Dashboard
              </a>
            </div>
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
