import React from 'react';
import { useAccount } from 'wagmi';
import { useUserRewards } from '../../hooks/rewards/useUserRewards';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const ProfileRewards: React.FC = () => {
  const { isConnected } = useAccount();
  const { totalSales, totalEarned, pendingWithdrawal, withdrawn, isLoading } = useUserRewards();
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <header>
        <h1 className={`font-bold text-gradient ${
          isMobile ? 'text-2xl' : 'text-3xl'
        }`}>
          Rewards for Sale
        </h1>
        <p className={`text-gray-400 mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          Ganancias recibidas por ventas de NFTs en el marketplace
        </p>
      </header>

      {isConnected ? (
        <>
          {/* Stats Overview */}
          {isLoading ? (
            <div className="card-content text-center py-8">
              <LoadingSpinner />
              <p className="text-gray-400 mt-4">Loading rewards data...</p>
            </div>
          ) : (
            <section className={`grid gap-4 ${
              isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            }`}>
              <div className={`card-stats ${isMobile ? 'p-3' : ''}`}>
                <h3 className={`font-semibold text-gray-400 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>Total Sales</h3>
                <p className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-2xl'}`}>{totalSales}</p>
              </div>

              <div className={`card-stats ${isMobile ? 'p-3' : ''}`}>
                <h3 className={`font-semibold text-gray-400 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>Total Earned</h3>
                <p className={`font-bold text-green-400 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {parseFloat(totalEarned).toFixed(isMobile ? 2 : 4)} POL
                </p>
              </div>

              <div className={`card-stats ${isMobile ? 'p-3' : ''}`}>
                <h3 className={`font-semibold text-gray-400 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>Pending</h3>
                <p className={`font-bold text-yellow-400 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {parseFloat(pendingWithdrawal).toFixed(isMobile ? 2 : 4)} POL
                </p>
              </div>

              <div className={`card-stats ${isMobile ? 'p-3' : ''}`}>
                <h3 className={`font-semibold text-gray-400 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>Withdrawn</h3>
                <p className={`font-bold text-purple-400 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {parseFloat(withdrawn).toFixed(isMobile ? 2 : 4)} POL
                </p>
              </div>
            </section>
          )}

          {/* Sales History */}
          <section className="card-content">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Sales History</h2>
              <button className="btn-secondary text-sm" disabled>
                Withdraw All
              </button>
            </div>

            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-full bg-yellow-600/20 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Sales Yet</h3>
              <p className="text-gray-400 text-sm mb-6">List your NFTs on the marketplace to start earning</p>
              <a href="/marketplace" className="btn-primary inline-block">
                Go to Marketplace
              </a>
            </div>
          </section>
        </>
      ) : (
        <div className="card-content text-center py-16">
          <p className="text-gray-400">Connect your wallet to view your rewards</p>
        </div>
      )}
    </div>
  );
};

export default ProfileRewards;
