import { useUserProfile, useXPProgress } from '../../hooks/marketplace/useUserProfile';
import { useAchievements } from '../../hooks/marketplace/useAchievements';

/**
 * Componente para mostrar el perfil gamificado del usuario
 * Incluye XP, nivel, progreso y achievements
 */
export default function GamificationProfile() {
  const { userProfile, level, isLoading } = useUserProfile();
  const { progress, xpForNextLevel, currentXP } = useXPProgress();
  const { totalUnlocked, completionPercentage } = useAchievements();

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
      {/* Header with Level */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{level}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Level {level}</h3>
            <p className="text-sm text-white/60">{currentXP.toString()} XP</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-white/60 mb-1">Next Level</div>
          <div className="text-lg font-bold text-white">{xpForNextLevel.toString()} XP</div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-white/60 mb-2">
          <span>Level {level}</span>
          <span>{progress.toFixed(1)}%</span>
          <span>Level {level + 1}</span>
        </div>
        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-2xl mb-2">🎨</div>
          <div className="text-xl font-bold text-white">{typeof userProfile.nftsCreated === 'bigint' ? userProfile.nftsCreated.toString() : userProfile.nftsCreated}</div>
          <div className="text-xs text-white/60">NFTs Created</div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-xl font-bold text-white">{typeof userProfile.nftsSold === 'bigint' ? userProfile.nftsSold.toString() : userProfile.nftsSold}</div>
          <div className="text-xs text-white/60">NFTs Sold</div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-2xl mb-2">🛒</div>
          <div className="text-xl font-bold text-white">{typeof userProfile.nftsBought === 'bigint' ? userProfile.nftsBought.toString() : userProfile.nftsBought}</div>
          <div className="text-xs text-white/60">NFTs Bought</div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-2xl mb-2">🏆</div>
          <div className="text-xl font-bold text-white">{totalUnlocked}</div>
          <div className="text-xs text-white/60">Achievements</div>
        </div>
      </div>

      {/* Achievements Progress */}
      <div className="bg-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white">Achievement Progress</h4>
          <span className="text-sm text-purple-400 font-semibold">{completionPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Rewards */}
      {userProfile.referralCount && (typeof userProfile.referralCount === 'bigint' ? userProfile.referralCount > BigInt(0) : userProfile.referralCount > 0) && (
        <div className="mt-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">👥</span>
              <div>
                <div className="text-sm font-semibold text-white">Referral Program</div>
                <div className="text-xs text-white/60">{typeof userProfile.referralCount === 'bigint' ? userProfile.referralCount.toString() : userProfile.referralCount} referrals</div>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:opacity-90 transition-opacity">
              Invite Friends
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
