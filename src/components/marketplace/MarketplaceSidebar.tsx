import { useUserProfile, useXPProgress } from '../../hooks/marketplace/useUserProfile';
import { useAchievements } from '../../hooks/marketplace/useAchievements';
import { useAccount } from 'wagmi';

/**
 * Sidebar lateral izquierdo para Marketplace
 * Muestra perfil gamificado con XP, nivel, progreso y achievements
 */
export default function MarketplaceSidebar() {
  const { address, isConnected } = useAccount();
  const { userProfile, level, isLoading } = useUserProfile();
  const { progress, xpForNextLevel, currentXP } = useXPProgress();
  const { totalUnlocked, completionPercentage } = useAchievements();

  if (!isConnected) {
    return null;
  }

  if (isLoading) {
    return (
      <aside className="card-unified h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-white/5 rounded-xl"></div>
          <div className="h-4 bg-white/5 rounded w-3/4"></div>
          <div className="h-4 bg-white/5 rounded w-1/2"></div>
        </div>
      </aside>
    );
  }

  if (!userProfile) {
    return null;
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <aside className="card-unified sticky top-8 space-y-6">
      {/* User Profile Header */}
      <div className="text-center pb-6 border-b border-white/10">
        {/* Avatar with gradient */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-600 animate-pulse opacity-75"></div>
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl">
            {level}
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-1">Level {level}</h3>
        <p className="text-xs text-white/60 font-mono bg-black/20 rounded-full px-3 py-1 inline-block">
          {address ? formatAddress(address) : '@not_connected'}
        </p>
      </div>

      {/* XP Progress */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-white">Experience</span>
          <span className="text-xs text-white/60">{currentXP.toString()} XP</span>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-1.5">
            <span>Lvl {level}</span>
            <span className="text-purple-400 font-semibold">{progress.toFixed(0)}%</span>
            <span>Lvl {level + 1}</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-white/60">
            {xpForNextLevel.toString()} XP to next level
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3">
          Your Stats
        </h4>

        <div className="space-y-2">
          {/* NFTs Created */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-white/5">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🎨</span>
              <span className="text-sm text-white/80">Created</span>
            </div>
            <span className="text-lg font-bold text-white">
              {userProfile.nftsCreated.toString()}
            </span>
          </div>

          {/* NFTs Sold */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-white/5">
            <div className="flex items-center space-x-3">
              <span className="text-xl">💰</span>
              <span className="text-sm text-white/80">Sold</span>
            </div>
            <span className="text-lg font-bold text-white">
              {userProfile.nftsSold.toString()}
            </span>
          </div>

          {/* NFTs Bought */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-500/10 to-red-500/10 rounded-lg border border-white/5">
            <div className="flex items-center space-x-3">
              <span className="text-xl">🛒</span>
              <span className="text-sm text-white/80">Bought</span>
            </div>
            <span className="text-lg font-bold text-white">
              {userProfile.nftsBought.toString()}
            </span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wide">
            🏆 Achievements
          </h4>
          <span className="text-xs text-purple-400 font-bold">{totalUnlocked}</span>
        </div>

        <div className="space-y-2">
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-xs text-white/60 text-center">
            {completionPercentage.toFixed(0)}% Complete
          </p>
        </div>
      </div>

      {/* Referral Section */}
      {userProfile.referralCount && (typeof userProfile.referralCount === 'bigint' ? userProfile.referralCount > BigInt(0) : userProfile.referralCount > 0) && (
        <div className="pt-4 border-t border-white/10">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-2xl">👥</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">Referrals</div>
                <div className="text-xs text-white/60">
                  {typeof userProfile.referralCount === 'bigint' ? userProfile.referralCount.toString() : userProfile.referralCount} friends invited
                </div>
              </div>
            </div>
            <button className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity">
              Invite More Friends
            </button>
          </div>
        </div>
      )}

      {/* Activity Indicator */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-center space-x-2 text-xs text-white/40">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Active</span>
        </div>
      </div>
    </aside>
  );
}
