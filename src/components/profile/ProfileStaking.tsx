import React from 'react';
import { useAccount } from 'wagmi';
import { useUserStaking } from '../../hooks/staking/useUserStaking';
import LoadingSpinner from '../../ui/LoadingSpinner';

const ProfileStaking: React.FC = () => {
  const { isConnected } = useAccount();
  const { totalStaked, pendingRewards, apy, activePositions, isLoading } = useUserStaking();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          My Staking
        </h1>
        <p className="text-sm text-gray-400 mt-2">Gestiona tus posiciones de staking</p>
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
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card-stats">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Total Staked</h3>
                <p className="text-2xl font-bold text-white">{parseFloat(totalStaked).toFixed(4)} POL</p>
                <p className="text-xs text-gray-500 mt-1">{activePositions} position{activePositions !== 1 ? 's' : ''}</p>
              </div>

              <div className="card-stats">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Rewards Earned</h3>
                <p className="text-2xl font-bold text-green-400">{parseFloat(pendingRewards).toFixed(4)} POL</p>
                <p className="text-xs text-gray-500 mt-1">Claimable rewards</p>
              </div>

              <div className="card-stats">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">APY</h3>
                <p className="text-2xl font-bold text-purple-400">{apy}%</p>
                <p className="text-xs text-gray-500 mt-1">Annual Percentage Yield</p>
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
