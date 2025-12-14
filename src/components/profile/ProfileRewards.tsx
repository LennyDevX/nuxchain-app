import React from 'react';
import { useAccount } from 'wagmi';
import { useUserRewards } from '../../hooks/rewards/useUserRewards';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const ProfileRewards: React.FC = () => {
  const { isConnected } = useAccount();
  const { totalSales, totalEarned, pendingWithdrawal, withdrawn, isLoading } = useUserRewards();
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <header>
        <h1 className={`font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent ${
          isMobile ? 'text-2xl' : 'text-3xl'
        }`}>
          Rewards for Sale
        </h1>
        <p className={`text-gray-400 mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          Earnings received from NFT sales in the marketplace
        </p>
      </header>

      {isConnected ? (
        <>
          {/* Stats Overview */}
          {isLoading ? (
            <div className="card-unified text-center py-12">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-yellow-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-400 mt-4">Loading rewards data...</p>
            </div>
          ) : (
            <section className={`grid gap-4 ${
              isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            }`}>
              <div className={`card-unified ${isMobile ? 'p-3' : 'p-5'} bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:scale-105 transition-transform`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <span className="text-2xl">🛒</span>
                  </div>
                </div>
                <h3 className={`font-semibold text-gray-400 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>Total Sales</h3>
                <p className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-3xl'}`}>{totalSales}</p>
                <p className="text-xs text-gray-500 mt-2">NFTs sold</p>
              </div>

              <div className={`card-unified ${isMobile ? 'p-3' : 'p-5'} bg-gradient-to-br from-green-500/10 to-green-600/5 hover:scale-105 transition-transform`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                <h3 className={`font-semibold text-gray-400 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>Total Earned</h3>
                <p className={`font-bold text-green-400 ${isMobile ? 'text-xl' : 'text-3xl'}`}>
                  {parseFloat(totalEarned).toFixed(isMobile ? 2 : 4)}
                </p>
                <p className="text-xs text-gray-500 mt-2">POL</p>
              </div>

              <div className={`card-unified ${isMobile ? 'p-3' : 'p-5'} bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 hover:scale-105 transition-transform`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-2xl">⏳</span>
                  </div>
                </div>
                <h3 className={`font-semibold text-gray-400 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>Pending</h3>
                <p className={`font-bold text-yellow-400 ${isMobile ? 'text-xl' : 'text-3xl'}`}>
                  {parseFloat(pendingWithdrawal).toFixed(isMobile ? 2 : 4)}
                </p>
                <p className="text-xs text-gray-500 mt-2">POL</p>
              </div>

              <div className={`card-unified ${isMobile ? 'p-3' : 'p-5'} bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:scale-105 transition-transform`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
                <h3 className={`font-semibold text-gray-400 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>Withdrawn</h3>
                <p className={`font-bold text-purple-400 ${isMobile ? 'text-xl' : 'text-3xl'}`}>
                  {parseFloat(withdrawn).toFixed(isMobile ? 2 : 4)}
                </p>
                <p className="text-xs text-gray-500 mt-2">POL</p>
              </div>
            </section>
          )}

          {/* Sales History */}
          <section className="card-unified p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                  <span className="text-xl">📜</span>
                </div>
                <h2 className="text-xl font-bold text-white">Sales History</h2>
              </div>
              <button className="btn-secondary text-sm opacity-50 cursor-not-allowed" disabled>
                Withdraw All
              </button>
            </div>

            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Sales Yet</h3>
              <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                List your NFTs on the marketplace to start earning rewards from sales
              </p>
              <a href="/marketplace" className="btn-primary inline-flex items-center gap-2">
                <span>🏪</span>
                <span>Go to Marketplace</span>
              </a>
            </div>
          </section>
        </>
      ) : (
        <div className="card-unified text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-300 font-medium mb-2">Connect Your Wallet</p>
          <p className="text-gray-400">Connect your wallet to view your rewards</p>
        </div>
      )}
    </div>
  );
};

export default ProfileRewards;
