import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rarity } from '../../types/contracts';
import { SkillCard } from './SkillCard';
import {
  RARITY_COLOR_MAP,
  RARITY_NAMES,
  SKILL_CATEGORY_NAMES,
  SKILL_CATEGORY_DESCRIPTIONS,
  SKILL_TYPE_CATEGORY,
  SkillCategory,
  type SkillData,
} from './config';

interface SkillsGridByRarityProps {
  skills: SkillData[];
  onSkillClick: (skill: SkillData) => void;
}

interface ExpandedState {
  category: SkillCategory | null;
  rarity: Rarity | null;
}

export const SkillsGridByRarity: React.FC<SkillsGridByRarityProps> = ({ skills, onSkillClick }) => {
  const [expanded, setExpanded] = useState<ExpandedState>({ category: null, rarity: null });

  // Group skills by category and rarity
  const groupedSkills = React.useMemo(() => {
    const groups: Record<SkillCategory, Record<Rarity, SkillData[]>> = {
      [SkillCategory.STAKING]: {
        [Rarity.COMMON]: [],
        [Rarity.UNCOMMON]: [],
        [Rarity.RARE]: [],
        [Rarity.EPIC]: [],
        [Rarity.LEGENDARY]: [],
      },
      [SkillCategory.MARKETPLACE]: {
        [Rarity.COMMON]: [],
        [Rarity.UNCOMMON]: [],
        [Rarity.RARE]: [],
        [Rarity.EPIC]: [],
        [Rarity.LEGENDARY]: [],
      },
    };

    skills.forEach((skill) => {
      const category = SKILL_TYPE_CATEGORY[skill.skillType];
      groups[category][skill.rarity].push(skill);
    });

    return groups;
  }, [skills]);

  const toggleRarityExpanded = (category: SkillCategory, rarity: Rarity) => {
    setExpanded((prev) => {
      if (prev.category === category && prev.rarity === rarity) {
        return { category: null, rarity: null };
      }
      return { category, rarity };
    });
  };

  const isExpanded = (category: SkillCategory, rarity: Rarity) => {
    return expanded.category === category && expanded.rarity === rarity;
  };

  const rarityOrder: Rarity[] = [
    Rarity.COMMON,
    Rarity.UNCOMMON,
    Rarity.RARE,
    Rarity.EPIC,
    Rarity.LEGENDARY,
  ];

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Title */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="jersey-15-regular text-5xl md:text-6xl text-white mb-4">Explore All Skills</h2>
        <p className="jersey-20-regular text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
          Browse through 85 unique skill combinations organized by category and rarity. Click on any rarity to expand and explore all available skills.
        </p>
      </motion.div>

      <div className="space-y-12">
        {([SkillCategory.STAKING, SkillCategory.MARKETPLACE] as const).map((category) => (
          <motion.div
            key={category}
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Category Header */}
            <div className="mb-8">
              <h3 className="jersey-15-regular text-3xl md:text-4xl text-white mb-2">
                {SKILL_CATEGORY_NAMES[category]}
              </h3>
              <p className="jersey-20-regular text-lg md:text-xl text-gray-400">{SKILL_CATEGORY_DESCRIPTIONS[category]}</p>
            </div>

            {/* Rarity Sections */}
            <div className="space-y-4">
              {rarityOrder.map((rarity) => {
                const raritySkills = groupedSkills[category][rarity];
                const skillCount = raritySkills.length;
                const isRarityExpanded = isExpanded(category, rarity);

                return (
                  <motion.div
                    key={`${category}-${rarity}`}
                    className="border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
                    layout
                  >
                    {/* Rarity Header - Collapsible */}
                    <motion.button
                      onClick={() => toggleRarityExpanded(category, rarity)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-900/30 transition-colors bg-gray-900/20"
                      layout
                    >
                      <div className="flex items-center gap-4">
                        {/* Color Indicator */}
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: RARITY_COLOR_MAP[rarity] }}
                        />

                        {/* Rarity Name */}
                        <div className="text-left">
                          <h4 className="jersey-15-regular text-xl md:text-2xl text-white">
                            {RARITY_NAMES[rarity]}
                          </h4>
                        </div>

                        {/* Skill Count Badge */}
                        <div className="ml-4 px-3 py-1 bg-gray-800/50 rounded-full jersey-20-regular text-base md:text-lg text-gray-300">
                          {skillCount} {skillCount === 1 ? 'skill' : 'skills'}
                        </div>
                      </div>

                      {/* Expand/Collapse Icon */}
                      <motion.div
                        animate={{ rotate: isRarityExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-gray-400"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </motion.div>
                    </motion.button>

                    {/* Skills Grid - Collapsible */}
                    <AnimatePresence initial={false}>
                      {isRarityExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-800 bg-gray-900/10"
                        >
                          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {raritySkills.map((skill) => (
                              <motion.div
                                key={skill.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <SkillCard
                                  skill={skill}
                                  onClick={onSkillClick}
                                  isCompact={true}
                                />
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Rarity Legend */}
      <motion.div
        className="mt-16 card-unified p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="jersey-15-regular text-2xl md:text-3xl text-white mb-4">📊 Rarity Effects</h3>
        <p className="jersey-20-regular text-base md:text-lg text-gray-400 mb-4">
          Rarity multiplies the base effect of each skill. Higher rarity = stronger benefits.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {rarityOrder.map((rarity) => (
            <div
              key={rarity}
              className="p-3 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: RARITY_COLOR_MAP[rarity] }}
                />
                <span className="jersey-15-regular text-lg md:text-xl text-white">{RARITY_NAMES[rarity]}</span>
              </div>
              <p className="jersey-20-regular text-sm md:text-base text-gray-400">
                {rarity === Rarity.COMMON && '1.0x'}
                {rarity === Rarity.UNCOMMON && '1.1x'}
                {rarity === Rarity.RARE && '1.2x'}
                {rarity === Rarity.EPIC && '1.4x'}
                {rarity === Rarity.LEGENDARY && '1.8x'}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        className="mt-12 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex gap-4">
          <div className="text-3xl md:text-4xl">💡</div>
          <div>
            <h4 className="jersey-15-regular text-xl md:text-2xl text-white mb-2">Pro Tips</h4>
            <ul className="jersey-20-regular text-base md:text-lg text-gray-300 space-y-1">
              <li>✨ Combine different skill types to maximize your benefits</li>
              <li>🚀 Higher rarity skills provide stronger effects with multipliers</li>
              <li>⏰ Skills last 30 days and can be renewed before expiration</li>
              <li>🔒 Max 3 active skills per user to ensure fair gameplay</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
