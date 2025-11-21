import React, { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkillNFTs } from '../../hooks/staking/useSkillNFTs';
import { useIsMobile } from '../../hooks/mobile';
import { getOptimizedFontSize } from '../../utils/mobile/performanceOptimization';
import { SkeletonLoader } from '../ui/SkeletonLoader';

/**
 * ✅ Optimized skill item component to prevent unnecessary re-renders
 */
const SkillItem = React.memo(({
  skillId,
  fontSize,
  index
}: {
  skillId: bigint
  fontSize: { small: number; label: number }
  index: number
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className="flex items-center justify-between bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors"
  >
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg flex items-center justify-center">
        <span
          className="font-medium"
          style={{ fontSize: `${fontSize.small}px` }}
        >
          #{skillId.toString()}
        </span>
      </div>
      <div>
        <div
          className="font-medium text-white"
          style={{ fontSize: `${fontSize.label}px` }}
        >
          Skill NFT #{skillId.toString()}
        </div>
        <div
          className="text-white/60"
          style={{ fontSize: `${fontSize.small}px` }}
        >
          Providing staking bonuses
        </div>
      </div>
    </div>
    <div className="px-2 py-1 bg-green-500/20 rounded-full">
      <span
        className="font-semibold text-green-400"
        style={{ fontSize: `${fontSize.small}px` }}
      >
        Active
      </span>
    </div>
  </motion.div>
));

SkillItem.displayName = 'SkillItem';

/**
 * Componente para mostrar el perfil de Skills NFT del usuario en el dashboard de staking
 * Muestra skills activos, boosts y estado de auto-compound
 * ✅ Totalmente optimizado para evitar re-renders innecesarios
 * ✅ Versión compacta para desktop en sidebar
 */
const SkillsProfile = React.memo(() => {
  const { userSkillProfile, activeSkills, hasAutoCompound, totalBoost, isLoading } = useSkillNFTs();
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isCollapsed, setIsCollapsed] = useState(isMobile); // Mobile: collapsed by default, Desktop: expanded

  // ✅ Font sizes adaptativos
  const fontSize = useMemo(() => ({
    title: getOptimizedFontSize(16, isMobile),
    value: getOptimizedFontSize(14, isMobile),
    label: getOptimizedFontSize(12, isMobile),
    small: getOptimizedFontSize(11, isMobile),
  }), [isMobile])

  // ✅ Handle expand with automatic scroll (mobile only)
  const handleExpand = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)

    // Scroll to component when expanding on mobile
    if (newState === false && isMobile && containerRef.current) {
      setTimeout(() => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          const scrollTop = window.scrollY || document.documentElement.scrollTop
          const targetTop = scrollTop + rect.top - 80

          window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
          })
        }
      }, 150) // Wait for animation to complete
    }
  }

  // ✅ Grid columns adaptativos: 2x2 en mobile, 4 en desktop
  const gridCols = useMemo(() => isMobile ? 2 : 4, [isMobile])

  // Memoize displayed skills to avoid re-renders
  const displayedSkills = useMemo(() => {
    return activeSkills.slice(0, 3);
  }, [activeSkills]);

  // Memoize loading state
  const loadingComponent = useMemo(() => (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
      <SkeletonLoader width="w-1/3" height="h-6" rounded="md" className="mb-4" />
      <SkeletonLoader width="w-1/2" height="h-4" rounded="md" />
    </div>
  ), []);

  // Memoize empty state
  const emptyComponent = useMemo(() => (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
      <div className="text-center">
        <div className="text-4xl mb-3">🎮</div>
        <h3 className="text-lg font-bold text-white mb-2">No Skills Active</h3>
        <p className="text-white/60 text-sm mb-4">
          Activate NFT Skills from the Marketplace to boost your staking rewards
        </p>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity">
          Browse Skills NFTs
        </button>
      </div>
    </div>
  ), []);

  if (isLoading) {
    return loadingComponent;
  }

  if (!userSkillProfile) {
    return emptyComponent;
  }

  // ✅ Collapsed/Expanded with smooth animations
  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          // ✅ Compact version (mobile collapsed or desktop sidebar)
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-xl border border-white/10 p-4"
          >
            {/* Collapsed Header */}
            <motion.button
              onClick={handleExpand}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between p-2 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">⚡</span>
                <h3 className="font-semibold text-white text-sm">Skills Profile</h3>
              </div>
              <motion.span
                className="text-white text-lg inline-block"
                animate={{ rotate: isCollapsed ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                ▼
              </motion.span>
            </motion.button>

            {/* Compact Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="grid grid-cols-2 gap-2 mt-3"
            >
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-sm font-bold text-white">{userSkillProfile.activeSkillsCount}</div>
                <div className="text-xs text-white/60">Active</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-sm font-bold text-green-400">+{totalBoost}%</div>
                <div className="text-xs text-white/60">Boost</div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          // ✅ Expanded version
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl border border-white/10 p-6"
          >
            {/* Header with toggle button for desktop */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-xl">⚡</span>
                </motion.div>
                <div>
                  <h3
                    className="font-bold text-white"
                    style={{ fontSize: `${fontSize.title}px` }}
                  >
                    Skills Profile
                  </h3>
                  <p
                    className="text-white/60"
                    style={{ fontSize: `${fontSize.small}px` }}
                  >
                    Active NFT Boosts
                  </p>
                </div>
              </div>

              {/* Desktop: Toggle collapse button */}
              {!isMobile && (
                <motion.button
                  onClick={handleExpand}
                  whileHover={{ scale: 1.1, color: 'rgba(255,255,255,0.8)' }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white/40 transition-colors"
                  title="Collapse"
                >
                  <motion.span
                    className="text-white text-lg inline-block"
                    animate={{ rotate: isCollapsed ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    ▼
                  </motion.span>
                </motion.button>
              )}

              {/* Mobile: Toggle collapse button + Total boost badge */}
              {isMobile && (
                <div className="flex items-center space-x-3">
                  {totalBoost > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full"
                    >
                      <span
                        className="font-bold text-purple-300"
                        style={{ fontSize: `${fontSize.label}px` }}
                      >
                        +{totalBoost}%
                      </span>
                    </motion.div>
                  )}
                  <motion.button
                    onClick={handleExpand}
                    whileHover={{ scale: 1.1, color: 'rgba(255,255,255,0.8)' }}
                    whileTap={{ scale: 0.95 }}
                    className="text-white/40 transition-colors"
                    title="Collapse"
                  >
                    <motion.span
                      className="text-white text-lg inline-block"
                      animate={{ rotate: isCollapsed ? 0 : 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      ▼
                    </motion.span>
                  </motion.button>
                </div>
              )}
            </motion.div>

            {/* Stats Grid - ✅ Columnas adaptativas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                gap: '1rem'
              }}
              className="mb-6"
            >
              {[
                { emoji: '🎯', label: 'Active Skills', value: userSkillProfile.activeSkillsCount, color: 'text-white' },
                { emoji: '📈', label: 'Staking Boost', value: `+${totalBoost}%`, color: 'text-green-400' },
                { emoji: '🔄', label: 'Auto-Compound', value: hasAutoCompound ? 'ON' : 'OFF', color: hasAutoCompound ? 'text-green-400' : 'text-white/40' },
                { emoji: '⏱️', label: 'Lockup Reduction', value: `-${userSkillProfile.lockupReduction}%`, color: 'text-blue-400' }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 + idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/5 rounded-xl p-4"
                >
                  <div className="text-2xl mb-2">{stat.emoji}</div>
                  <div
                    className={`font-bold ${stat.color}`}
                    style={{ fontSize: `${fontSize.value + 4}px` }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-white/60"
                    style={{ fontSize: `${fontSize.small}px` }}
                  >
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Active Skills List */}
            {activeSkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h4
                  className="font-semibold text-white/80 mb-3"
                  style={{ fontSize: `${fontSize.label}px` }}
                >
                  Active Skills
                </h4>
                <div className="space-y-2">
                  {displayedSkills.map((skillId, idx) => (
                    <SkillItem
                      key={skillId.toString()}
                      skillId={skillId}
                      fontSize={{ small: fontSize.small, label: fontSize.label }}
                      index={idx}
                    />
                  ))}
                </div>

                {activeSkills.length > 3 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.25 }}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-3 py-2 text-purple-400 hover:text-purple-300 transition-colors"
                    style={{ fontSize: `${fontSize.label}px` }}
                  >
                    View all {activeSkills.length} skills →
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Info Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <span className="text-xl">💡</span>
                <div className="flex-1">
                  <p
                    className="text-white/70"
                    style={{ fontSize: `${fontSize.small}px` }}
                  >
                    <span className="font-semibold text-purple-300">Tip:</span> Activate more Skills NFTs from the Marketplace to increase your rewards and unlock special features like Auto-Compound!
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

SkillsProfile.displayName = 'SkillsProfile';

export default SkillsProfile;
