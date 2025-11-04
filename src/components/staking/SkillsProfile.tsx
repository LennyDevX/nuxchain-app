import React, { useMemo } from 'react';
import { useSkillNFTs } from '../../hooks/staking/useSkillNFTs';
import { useIsMobile } from '../../hooks/mobile';
import { getOptimizedFontSize } from '../../utils/mobile/performanceOptimization';

/**
 * Componente para mostrar el perfil de Skills NFT del usuario en el dashboard de staking
 * Muestra skills activos, boosts y estado de auto-compound
 */
const SkillsProfile = React.memo(() => {
  const { userSkillProfile, activeSkills, hasAutoCompound, totalBoost, isLoading } = useSkillNFTs();
  const isMobile = useIsMobile()

  // ✅ Font sizes adaptativos
  const fontSize = useMemo(() => ({
    title: getOptimizedFontSize(16, isMobile),
    value: getOptimizedFontSize(14, isMobile),
    label: getOptimizedFontSize(12, isMobile),
    small: getOptimizedFontSize(11, isMobile),
  }), [isMobile])

  // ✅ Grid columns adaptativos: 2x2 en mobile, 4 en desktop
  const gridCols = useMemo(() => isMobile ? 2 : 4, [isMobile])

  // Memoize displayed skills to avoid re-renders
  const displayedSkills = useMemo(() => {
    return activeSkills.slice(0, 3);
  }, [activeSkills]);

  // Memoize loading state
  const loadingComponent = useMemo(() => (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-white/10 rounded w-1/2"></div>
      </div>
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

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-xl">⚡</span>
          </div>
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
        
        {totalBoost > 0 && (
          <div className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full">
            <span 
              className="font-bold text-purple-300"
              style={{ fontSize: `${fontSize.label}px` }}
            >
              +{totalBoost}% Total Boost
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid - ✅ Columnas adaptativas */}
      <div 
        style={{ 
          display: 'grid',
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          gap: '1rem'
        }}
        className="mb-6"
      >
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-2xl mb-2">🎯</div>
          <div 
            className="font-bold text-white"
            style={{ fontSize: `${fontSize.value + 4}px` }}
          >
            {userSkillProfile.activeSkillsCount}
          </div>
          <div 
            className="text-white/60"
            style={{ fontSize: `${fontSize.small}px` }}
          >
            Active Skills
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-2xl mb-2">📈</div>
          <div 
            className="font-bold text-green-400"
            style={{ fontSize: `${fontSize.value + 4}px` }}
          >
            +{totalBoost}%
          </div>
          <div 
            className="text-white/60"
            style={{ fontSize: `${fontSize.small}px` }}
          >
            Staking Boost
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-2xl mb-2">🔄</div>
          <div 
            className={`font-bold ${hasAutoCompound ? 'text-green-400' : 'text-white/40'}`}
            style={{ fontSize: `${fontSize.value + 4}px` }}
          >
            {hasAutoCompound ? 'ON' : 'OFF'}
          </div>
          <div 
            className="text-white/60"
            style={{ fontSize: `${fontSize.small}px` }}
          >
            Auto-Compound
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-2xl mb-2">⏱️</div>
          <div 
            className="font-bold text-blue-400"
            style={{ fontSize: `${fontSize.value + 4}px` }}
          >
            -{userSkillProfile.lockupReduction}%
          </div>
          <div 
            className="text-white/60"
            style={{ fontSize: `${fontSize.small}px` }}
          >
            Lockup Reduction
          </div>
        </div>
      </div>

      {/* Active Skills List */}
      {activeSkills.length > 0 && (
        <div>
          <h4 
            className="font-semibold text-white/80 mb-3"
            style={{ fontSize: `${fontSize.label}px` }}
          >
            Active Skills
          </h4>
          <div className="space-y-2">
            {displayedSkills.map((skillId, index) => (
              <div
                key={index}
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
              </div>
            ))}
          </div>
          
          {activeSkills.length > 3 && (
            <button 
              className="w-full mt-3 py-2 text-purple-400 hover:text-purple-300 transition-colors"
              style={{ fontSize: `${fontSize.label}px` }}
            >
              View all {activeSkills.length} skills →
            </button>
          )}
        </div>
      )}

      {/* Info Banner */}
      <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
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
      </div>
    </div>
  );
});

SkillsProfile.displayName = 'SkillsProfile';

export default SkillsProfile;
