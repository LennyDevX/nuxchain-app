import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { RARITY_NAMES } from '../../types/contracts';
import type { SkillData } from '../skills/config';
import { calculateSkillPrice, getMarkupPercentage, isActiveSkill } from './pricing-config';

interface StoreSkillCardProps {
  skill: SkillData;
  onClick: (skill: SkillData) => void;
  isOwned?: boolean;
}

export const StoreSkillCard = memo<StoreSkillCardProps>(({ 
  skill, 
  onClick,
  isOwned = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const price = calculateSkillPrice(skill.skillType, skill.rarity, false);
  const markup = getMarkupPercentage(skill.skillType);
  const showMarkup = isActiveSkill(skill.skillType) && markup > 0;
  const isFree = price === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (skill.id % 6) * 0.05 }}
      viewport={{ once: true, margin: '-50px' }}
      className="h-full"
    >
      <motion.button
        onClick={() => onClick(skill)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isOwned}
        className={`w-full h-full relative group overflow-hidden rounded-xl bg-gray-900/50 border transition-all duration-300 p-6 flex flex-col justify-between ${
          isOwned 
            ? 'border-gray-700 cursor-default opacity-60' 
            : 'border-gray-800 cursor-pointer hover:border-opacity-100'
        }`}
        style={{
          borderColor: isHovered && !isOwned ? skill.color : undefined,
        }}
        whileHover={isOwned ? {} : { scale: 1.03 }}
        whileTap={isOwned ? {} : { scale: 0.98 }}
      >
        {/* Background glow effect */}
        {!isOwned && (
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            style={{ backgroundColor: skill.color }}
            animate={isHovered ? { opacity: 0.1 } : { opacity: 0 }}
          />
        )}

        {/* Owned Badge */}
        {isOwned && (
          <div className="absolute top-4 left-4 z-20 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1">
            <span className="text-xs font-bold text-green-400">✓ OWNED</span>
          </div>
        )}

        {/* Free Badge */}
        {isFree && !isOwned && (
          <motion.div
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: -12 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="absolute top-2 right-2 z-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg px-3 py-1.5 shadow-lg"
          >
            <span className="text-xs font-black text-white">✨ FREE</span>
          </motion.div>
        )}

        {/* Content */}
        <div className="relative z-10">
          {/* Icon and Rarity */}
          <div className="flex items-start justify-between mb-4">
            <motion.div
              animate={isHovered && !isOwned ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
              className="text-4xl"
            >
              {skill.icon}
            </motion.div>
            <div className="flex flex-col items-end gap-1">
              <span
                className="text-xs font-bold px-2 py-1 rounded-full text-white"
                style={{
                  backgroundColor: skill.color,
                }}
              >
                {RARITY_NAMES[skill.rarity]}
              </span>
              {showMarkup && markup > 0 && !isFree && !isOwned && (
                <span className="text-xs font-bold px-2 py-1 rounded-full text-white bg-orange-500/70">
                  +{markup}% ACTIVE
                </span>
              )}
            </div>
          </div>

          {/* Name (Abstract - e.g. "Stake Boost I") */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-white mb-1">
              {skill.name.split(' - ')[0]}
            </h3>
            <p className="text-sm text-gray-400">{skill.effectLabel}</p>
          </div>

          {/* Effect Badge - Exact values shown here */}
          <motion.div
            className="inline-block px-3 py-1 rounded-lg text-sm font-semibold text-white mb-4"
            style={{
              backgroundColor: `${skill.color}33`,
              border: `1px solid ${skill.color}`,
              color: skill.color,
            }}
            animate={isHovered && !isOwned ? { y: -2 } : { y: 0 }}
          >
            {skill.effectFormatted}
          </motion.div>
        </div>

        {/* Footer - Price and Description */}
        <div className="relative z-10 pt-4 border-t border-gray-700/50">
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{skill.description}</p>
          
          {/* Price Section */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {isFree ? (
                <span className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  FREE
                </span>
              ) : (
                <>
                  <span className="text-xl font-bold text-white">
                    {price} POL
                  </span>
                  {showMarkup && markup > 0 && (
                    <span className="text-xs text-gray-500">
                      +{markup}% premium
                    </span>
                  )}
                </>
              )}
            </div>

            {!isOwned && (
              <motion.div
                animate={isHovered ? { x: 4 } : { x: 0 }}
                className="flex items-center gap-2 text-sm font-semibold"
                style={{ color: skill.color }}
              >
                Buy
                <span>→</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
});

StoreSkillCard.displayName = 'StoreSkillCard';
