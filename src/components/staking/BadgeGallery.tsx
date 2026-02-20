import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatBadge, BADGE_METADATA } from '../../utils/staking/formatters';
import type { BadgeInfo } from '../../hooks/staking/useQuestManagement';

// ============================================
// TYPES
// ============================================

interface BadgeGalleryProps {
  badges: BadgeInfo[];
  badgeCount: number;
  isLoading?: boolean;
}

// All possible badge IDs from the contract
const ALL_BADGE_IDS = Object.keys(BADGE_METADATA).map(Number);

// ============================================
// BADGE GALLERY COMPONENT
// ============================================

const BadgeGallery: React.FC<BadgeGalleryProps> = memo(({ badges, isLoading }) => {
  // Map earned badges by ID for quick lookup
  const earnedBadgeMap = useMemo(() => {
    const map = new Map<number, BadgeInfo>();
    badges.forEach((b) => map.set(b.badgeId, b));
    return map;
  }, [badges]);

  // Sort: earned first, then locked
  const allBadges = useMemo(() => {
    return ALL_BADGE_IDS.map((id) => ({
      id,
      ...formatBadge(id),
      earned: earnedBadgeMap.has(id),
      earnedAt: earnedBadgeMap.get(id)?.earnedAt,
    })).sort((a, b) => {
      if (a.earned && !b.earned) return -1;
      if (!a.earned && b.earned) return 1;
      return a.id - b.id;
    });
  }, [earnedBadgeMap]);

  const earnedCount = badges.length;
  const totalCount = ALL_BADGE_IDS.length;
  const progressPercent = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  if (isLoading) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-white/10 rounded w-1/3" />
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl lg:text-3xl">🏅</span>
            <h3 className="jersey-15-regular text-white font-semibold text-2xl lg:text-3xl">Badge Collection</h3>
          </div>
          <span className="jersey-20-regular text-white/40 text-base lg:text-lg">
            {earnedCount}/{totalCount} earned
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative">
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          {progressPercent === 100 && (
            <motion.span
              className="jersey-15-regular absolute -top-5 right-0 text-amber-400 text-base lg:text-lg font-bold"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              ✨ Complete!
            </motion.span>
          )}
        </div>
      </div>

      {/* Badge Grid */}
      <div className="px-5 pb-5">
        <div className="grid grid-cols-5 gap-2.5">
          <AnimatePresence mode="popLayout">
            {allBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                className={`relative rounded-xl p-3 text-center transition-all cursor-default group ${
                  badge.earned
                    ? 'bg-gradient-to-b from-amber-500/10 to-amber-500/5 border border-amber-500/20 hover:border-amber-400/40'
                    : 'bg-white/[0.02] border border-white/[0.04] opacity-40'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: badge.earned ? 1 : 0.4, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={badge.earned ? { scale: 1.05, y: -2 } : {}}
              >
                {/* Icon */}
                <span className={`text-2xl block mb-1 ${!badge.earned ? 'grayscale' : ''}`}>
                  {badge.earned ? badge.icon : '🔒'}
                </span>

                {/* Name */}
                <p className={`jersey-15-regular text-sm lg:text-base font-medium leading-tight ${
                  badge.earned ? 'text-white/80' : 'text-white/25'
                }`}>
                  {badge.name}
                </p>

                {/* Tooltip on hover */}
                {badge.earned && (
                  <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg p-2.5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-xl">
                    <p className="jersey-15-regular text-white text-base lg:text-lg font-semibold mb-0.5">
                      {badge.icon} {badge.name}
                    </p>
                    <p className="jersey-20-regular text-white/50 text-sm lg:text-base mb-1">
                      {badge.description}
                    </p>
                    {badge.earnedAt && (
                      <p className="jersey-20-regular text-amber-400/60 text-xs lg:text-sm">
                        Earned {badge.earnedAt.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Lock tooltip for unearned */}
                {!badge.earned && (
                  <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg p-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-xl">
                    <p className="jersey-15-regular text-white/60 text-sm lg:text-base font-medium mb-0.5">
                      {badge.icon} {badge.name}
                    </p>
                    <p className="jersey-20-regular text-white/30 text-sm lg:text-base">
                      {badge.description}
                    </p>
                  </div>
                )}

                {/* Earned glow indicator */}
                {badge.earned && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-amber-400/5"
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Milestone hints */}
      {earnedCount < totalCount && (
        <div className="px-5 pb-4 border-t border-white/5 pt-3">
          <p className="jersey-15-regular text-white/30 text-base lg:text-lg uppercase tracking-wide mb-1.5">Next Badges</p>
          <div className="flex flex-wrap gap-1.5">
            {allBadges
              .filter((b) => !b.earned)
              .slice(0, 3)
              .map((badge) => (
                <span
                  key={badge.id}
                  className="inline-flex items-center gap-1 bg-white/5 border border-white/5 rounded-full px-2 py-0.5 jersey-20-regular text-white/30 text-sm lg:text-base"
                >
                  {badge.icon} {badge.description}
                </span>
              ))}
          </div>
        </div>
      )}
    </motion.div>
  );
});

BadgeGallery.displayName = 'BadgeGallery';

export default BadgeGallery;
