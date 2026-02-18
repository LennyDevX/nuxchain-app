import { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import useCollaboratorBadgeRewards from '../../hooks/colab/useCollaboratorBadgeRewards';

// Inline icons
const WalletIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

const TrophyIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function EnhancedRewardDashboard() {
  const { isConnected } = useAccount();
  const {
    contractStats,
    contractHealth,
    activeQuests,
    userContributionVolume,
    commissionTiers,
    pendingRewardsFormatted,
    netRewardFormatted,
    claimFeePercent,
    claimRewards,
    isClaiming,
    claimSuccess,
    claimHash,
    error,
    refreshData,
  } = useCollaboratorBadgeRewards();

  const [showSuccess, setShowSuccess] = useState(false);

  // Handle claim with success feedback
  const handleClaim = async () => {
    await claimRewards();
    if (claimSuccess) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: bigint) => {
    if (!timestamp || timestamp === 0n) return 'Not set';
    return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format duration
  const formatDuration = (startTime: bigint, endTime: bigint) => {
    if (!startTime || !endTime) return 'N/A';
    const duration = Number(endTime - startTime);
    const days = Math.floor(duration / 86400);
    return `${days} days`;
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
          <WalletIcon className="w-10 h-10 text-purple-400" />
        </div>
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-3">
          Connect Your Wallet
        </h3>
        <p className="text-gray-400 max-w-md">
          Please connect your wallet to view your rewards, track quest progress, and claim your earnings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">
            Reward Dashboard
          </h2>
          <p className="text-gray-400 text-sm">
            Track your earnings, complete quests, and claim rewards
          </p>
        </div>
        <button
          onClick={refreshData}
          disabled={isClaiming}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white text-sm font-bold uppercase tracking-wide transition-all disabled:opacity-50"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Rewards */}
        <div className="p-6 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <WalletIcon className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm font-bold uppercase tracking-wide">Pending</span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-white">
              {parseFloat(pendingRewardsFormatted).toFixed(4)} <span className="text-lg text-gray-500">POL</span>
            </div>
            <div className="text-sm text-gray-500">
              ~${(parseFloat(pendingRewardsFormatted) * 0.5).toFixed(2)} USD
            </div>
          </div>
        </div>

        {/* Net After Fees */}
        <div className="p-6 bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-gray-400 text-sm font-bold uppercase tracking-wide">You'll Receive</span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-white">
              {parseFloat(netRewardFormatted).toFixed(4)} <span className="text-lg text-gray-500">POL</span>
            </div>
            <div className="text-sm text-green-400">
              After {claimFeePercent.toFixed(2)}% fee
            </div>
          </div>
        </div>

        {/* Contribution Volume */}
        <div className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <ActivityIcon className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-400 text-sm font-bold uppercase tracking-wide">Your Volume</span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-white">
              {userContributionVolume ? formatEther(userContributionVolume).slice(0, 6) : '0'} <span className="text-lg text-gray-500">POL</span>
            </div>
            <div className="text-sm text-gray-500">
              Lifetime contributions
            </div>
          </div>
        </div>

        {/* Contract Health */}
        <div className={`p-6 bg-gradient-to-br ${contractHealth?.isHealthy ? 'from-green-500/10' : 'from-red-500/10'} to-transparent border ${contractHealth?.isHealthy ? 'border-green-500/20' : 'border-red-500/20'} rounded-2xl`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl ${contractHealth?.isHealthy ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
              <AlertCircleIcon className={`w-5 h-5 ${contractHealth?.isHealthy ? 'text-green-400' : 'text-red-400'}`} />
            </div>
            <span className="text-gray-400 text-sm font-bold uppercase tracking-wide">Pool Health</span>
          </div>
          <div className="space-y-1">
            <div className={`text-3xl font-black ${contractHealth?.isHealthy ? 'text-green-400' : 'text-red-400'}`}>
              {contractHealth?.isHealthy ? 'Healthy' : 'Low Funds'}
            </div>
            <div className="text-sm text-gray-500">
              {contractHealth ? (Number(contractHealth.solvencyRatio) / 100).toFixed(0) : '0'}% solvency
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Claim Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`relative overflow-hidden rounded-2xl border ${showSuccess ? 'border-green-500/30' : 'border-purple-500/20'} bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] p-8`}>
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-64 h-64 ${showSuccess ? 'bg-green-500/5' : 'bg-purple-500/5'} blur-3xl rounded-full`} />
            
            <div className="relative z-10">
              {showSuccess ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                    Rewards Claimed!
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Your rewards have been sent to your wallet.
                  </p>
                  {claimHash && (
                    <a
                      href={`https://polygonscan.com/tx/${claimHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold text-sm transition-all"
                    >
                      View Transaction
                    </a>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                        Available Rewards
                      </h3>
                      <p className="text-gray-400">
                        Claim your pending rewards to your wallet. A {claimFeePercent.toFixed(2)}% fee applies.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black text-white">
                        {parseFloat(pendingRewardsFormatted).toFixed(4)}
                      </div>
                      <div className="text-gray-500">POL</div>
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="p-4 bg-white/5 rounded-xl mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Gross Amount</span>
                      <span className="text-white font-bold">{parseFloat(pendingRewardsFormatted).toFixed(6)} POL</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Fee ({claimFeePercent.toFixed(2)}%)</span>
                      <span className="text-red-400 font-bold">
                        -{(parseFloat(pendingRewardsFormatted) * (claimFeePercent / 100)).toFixed(6)} POL
                      </span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                      <span className="text-gray-300 font-bold">Net Amount</span>
                      <span className="text-green-400 font-black">{parseFloat(netRewardFormatted).toFixed(6)} POL</span>
                    </div>
                  </div>

                  {/* Claim Button */}
                  <button
                    onClick={handleClaim}
                    disabled={isClaiming || parseFloat(pendingRewardsFormatted) === 0}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:opacity-90 text-white font-black text-lg uppercase tracking-[0.15em] rounded-2xl transition-all shadow-[0_10px_30px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:scale-[0.98]"
                  >
                    {isClaiming ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : parseFloat(pendingRewardsFormatted) === 0 ? (
                      'No Rewards Available'
                    ) : (
                      'Claim Rewards'
                    )}
                  </button>

                  {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                      {error}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Active Quests */}
          <div className="space-y-4">
            <h3 className="font-black text-white uppercase tracking-wide text-lg flex items-center gap-2">
              <TrophyIcon className="w-5 h-5 text-yellow-400" />
              Active Quests
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                {activeQuests.length}
              </span>
            </h3>

            {activeQuests.length === 0 ? (
              <div className="p-8 bg-[#1a1a1a]/50 border border-white/10 rounded-2xl text-center">
                <div className="w-16 h-16 bg-gray-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400">No active quests available at the moment.</p>
                <p className="text-gray-600 text-sm mt-2">Check back later for new opportunities!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeQuests.map((quest, index) => (
                  <div key={index} className="p-5 bg-[#1a1a1a]/50 border border-white/10 rounded-2xl hover:border-purple-500/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-white text-lg">{quest.description}</h4>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold uppercase">
                        Active
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Reward</span>
                        <span className="text-purple-400 font-bold">{formatEther(quest.rewardAmount)} POL</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Duration</span>
                        <span className="text-gray-300">{formatDuration(quest.startTime, quest.endTime)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Completions</span>
                        <span className="text-gray-300">
                          {quest.maxCompletions === 0n ? 'Unlimited' : `${quest.completionCount}/${quest.maxCompletions}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{formatDate(quest.startTime)}</span>
                        <span className="text-gray-500">→ {formatDate(quest.endTime)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contract Stats */}
          <div className="p-5 bg-[#1a1a1a]/50 border border-white/10 rounded-2xl">
            <h4 className="font-black text-white uppercase tracking-wide text-sm mb-4">
              Contract Overview
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Paid</span>
                <span className="text-white font-bold">
                  {contractStats ? formatEther(contractStats.paid).slice(0, 8) : '0'} POL
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Badge Holders</span>
                <span className="text-white font-bold">
                  {contractStats ? contractStats.holders.toString() : '0'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Quests</span>
                <span className="text-white font-bold">
                  {contractStats ? contractStats.questCount.toString() : '0'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Pool Balance</span>
                <span className="text-white font-bold">
                  {contractStats ? formatEther(contractStats.balance).slice(0, 8) : '0'} POL
                </span>
              </div>
            </div>
          </div>

          {/* Commission Tiers */}
          {commissionTiers.length > 0 && (
            <div className="p-5 bg-[#1a1a1a]/50 border border-white/10 rounded-2xl">
              <h4 className="font-black text-white uppercase tracking-wide text-sm mb-4">
                Fee Tiers
              </h4>
              <div className="space-y-2">
                {commissionTiers.map((tier, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {formatEther(tier.threshold)}+ POL
                    </span>
                    <span className="text-purple-400 font-bold">
                      {(Number(tier.rate) / 100).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 text-xs mt-3">
                Lower fees based on your contribution volume
              </p>
            </div>
          )}

          {/* Help Card */}
          <div className="p-5 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl">
            <h4 className="font-black text-white uppercase tracking-wide text-sm mb-2">
              Need Help?
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              Learn more about the collaborator program and how rewards work.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-bold transition-colors"
            >
              View Documentation
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
