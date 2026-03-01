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
    <section className="relative pt-16 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 sm:mb-12"
      >
        <motion.h1
          className="jersey-15-regular text-5xl md:text-6xl mb-4 sm:mb-6 leading-tight px-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="text-gradient">Skills Dashboard</span>
        </motion.h1>

        <motion.p
          className="jersey-20-regular text-xl md:text-2xl text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Discover <span className="text-blue-400">{totalSkillsCount} unique skills</span> across{' '}
          <span className="text-purple-400">17 types</span> and{' '}
          <span className="text-orange-400">5 rarities</span>. 
          Boost staking rewards, reduce fees, and unlock exclusive features.
        </motion.p>

        {/* Key Info Banner */}
        <motion.div
          className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-base md:text-lg">
            <div className="text-center">
              <div className="jersey-15-regular text-yellow-400 text-lg md:text-xl mb-1">⏰ 30 Days</div>
              <div className="jersey-20-regular text-gray-400 text-base md:text-lg">Duration per skill</div>
            </div>
            <div className="text-center">
              <div className="jersey-15-regular text-green-400 text-lg md:text-xl mb-1">💰 250 POL</div>
              <div className="jersey-20-regular text-gray-400 text-base md:text-lg">Min. staking required</div>
            </div>
            <div className="text-center">
              <div className="jersey-15-regular text-blue-400 text-lg md:text-xl mb-1">⚡ Max 3</div>
              <div className="jersey-20-regular text-gray-400 text-base md:text-lg">Active per type</div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="p-3 sm:p-4 md:p-6 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-purple-500/50 transition-all">
            <div className="jersey-20-regular text-4xl md:text-5xl text-purple-400 mb-1">{totalSkillsCount}</div>
            <div className="jersey-15-regular text-base md:text-lg text-gray-400">Total Skills</div>
          </div>
          <div className="p-3 sm:p-4 md:p-6 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-blue-500/50 transition-all">
            <div className="jersey-20-regular text-4xl md:text-5xl text-blue-400 mb-1">17</div>
            <div className="jersey-15-regular text-base md:text-lg text-gray-400">Skill Types</div>
          </div>
          <div className="p-3 sm:p-4 md:p-6 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-orange-500/50 transition-all col-span-2 sm:col-span-1">
            <div className="jersey-20-regular text-4xl md:text-5xl text-orange-400 mb-1">+{totalBoostPercentage}%</div>
            <div className="jersey-15-regular text-base md:text-lg text-gray-400">Max APY Boost</div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
