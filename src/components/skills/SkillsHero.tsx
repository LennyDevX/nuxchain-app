import React from 'react';
import { motion } from 'framer-motion';

interface SkillsHeroProps {
  totalSkillsCount: number;
  totalBoostPercentage: number;
}

export const SkillsHero: React.FC<SkillsHeroProps> = ({
  totalSkillsCount,
  totalBoostPercentage,
}) => {
  return (
    <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <motion.h1
          className="text-5xl md:text-6xl font-black mb-6 leading-tight"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="text-gradient">Skills Dashboard</span>
        </motion.h1>

        <motion.p
          className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Discover <span className="font-semibold text-blue-400">{totalSkillsCount} unique skills</span> across{' '}
          <span className="font-semibold text-purple-400">17 skill types</span> and{' '}
          <span className="font-semibold text-orange-400">5 rarity tiers</span>. 
          Enhance your staking rewards, reduce fees, and unlock exclusive platform features.
        </motion.p>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
            <div className="text-3xl font-bold text-purple-400">{totalSkillsCount}</div>
            <div className="text-sm text-gray-400">Available Skills</div>
          </div>
          <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
            <div className="text-3xl font-bold text-blue-400">17</div>
            <div className="text-sm text-gray-400">Skill Types</div>
          </div>
          <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
            <div className="text-3xl font-bold text-orange-400">+{totalBoostPercentage}%</div>
            <div className="text-sm text-gray-400">Max Staking Boost</div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
