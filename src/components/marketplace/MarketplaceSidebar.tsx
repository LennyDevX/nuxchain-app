import { motion } from 'framer-motion';
import { useUserProfile, useXPProgress } from '../../hooks/marketplace/useUserProfile';
import { useAchievements } from '../../hooks/marketplace/useAchievements';
import { useAccount } from 'wagmi';
import { SkeletonLoader } from '../ui/SkeletonLoader';

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
        <div className="space-y-4">
          <SkeletonLoader width="w-full" height="h-20" rounded="lg" className="mb-2" />
          <SkeletonLoader width="w-3/4" height="h-4" rounded="md" />
          <SkeletonLoader width="w-1/2" height="h-4" rounded="md" />
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
    <motion.aside 
      className="card-unified sticky top-8 space-y-6"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 25 }}
    >
      {/* User Profile Header */}
      <motion.div 
        className="text-center pb-6 border-b border-white/10"
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 300, damping: 30 }}
        whileHover={{ scale: 1.02 }}
      >
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
      </motion.div>

      {/* XP Progress */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 250, damping: 28 }}
      >
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
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="space-y-3 pt-4 border-t border-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3, staggerChildren: 0.08, delayChildren: 0.3 }}
      >
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3">
          Your Stats
        </h4>

        <div className="space-y-2">
          {/* NFTs Created */}
          <motion.div 
            className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-white/5"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 25 }}
            viewport={{ once: true }}
            whileHover={{ x: 4, boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">🎨</span>
              <span className="text-sm text-white/80">Created</span>
            </div>
            <span className="text-lg font-bold text-white">
              {userProfile.nftsCreated.toString()}
            </span>
          </motion.div>

          {/* NFTs Sold */}
          <motion.div 
            className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-white/5"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.08, type: 'spring', stiffness: 300, damping: 25 }}
            viewport={{ once: true }}
            whileHover={{ x: 4, boxShadow: '0 0 20px rgba(168, 85, 247, 0.2)' }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">💰</span>
              <span className="text-sm text-white/80">Sold</span>
            </div>
            <span className="text-lg font-bold text-white">
              {userProfile.nftsSold.toString()}
            </span>
          </motion.div>

          {/* NFTs Bought */}
          <motion.div 
            className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-500/10 to-red-500/10 rounded-lg border border-white/5"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.16, type: 'spring', stiffness: 300, damping: 25 }}
            viewport={{ once: true }}
            whileHover={{ x: 4, boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)' }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">🛒</span>
              <span className="text-sm text-white/80">Bought</span>
            </div>
            <span className="text-lg font-bold text-white">
              {userProfile.nftsBought.toString()}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div 
        className="pt-4 border-t border-white/10"
        initial={{ opacity: 0, rotateY: -20, y: 20 }}
        whileInView={{ opacity: 1, rotateY: 0, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, type: 'spring', stiffness: 250, damping: 28 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.02 }}
      >
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
      </motion.div>

      {/* Referral Section */}
      {userProfile.referralCount && (typeof userProfile.referralCount === 'bigint' ? userProfile.referralCount > BigInt(0) : userProfile.referralCount > 0) && (
        <motion.div 
          className="pt-4 border-t border-white/10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, type: 'spring', stiffness: 250, damping: 28 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.03 }}
        >
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
        </motion.div>
      )}

      {/* Activity Indicator */}
      <motion.div 
        className="pt-4 border-t border-white/10"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="flex items-center justify-center space-x-2 text-xs text-white/40">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Active</span>
        </div>
      </motion.div>
    </motion.aside>
  );
}
