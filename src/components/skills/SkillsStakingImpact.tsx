import React from 'react';
import { motion } from 'framer-motion';
import { Rarity } from '../../types/contracts';
import type { SkillData } from './config';

interface SkillsStakingImpactProps {
  skillsByRarity: Record<Rarity, SkillData[]>;
  totalStakingBoost: number;
}

export const SkillsStakingImpact: React.FC<SkillsStakingImpactProps> = ({
  skillsByRarity,
  totalStakingBoost,
}) => {
  const features = [
    {
      icon: '⚡',
      title: '250 POL Minimum',
      desc: 'Requires minimum 250 POL staked to activate any skill',
    },
    {
      icon: '🔄',
      title: 'Auto-Compound',
      desc: 'AUTO_COMPOUND skill automatically reinvests rewards daily',
    },
    {
      icon: '🔓',
      title: 'Lock Time Reduction',
      desc: 'LOCK_REDUCER can reduce lock periods up to 45% (LEGENDARY)',
    },
    {
      icon: '💎',
      title: 'Fee Discounts',
      desc: 'FEE_REDUCER skills save up to 45% on platform fees',
    },
    {
      icon: '📈',
      title: 'APY Multipliers',
      desc: 'STAKE_BOOST skills increase APY from +5% to +38%',
    },
    {
      icon: '⏰',
      title: '30-Day Duration',
      desc: 'Each skill lasts 30 days and can be renewed',
    },
  ];

  return (
    <section className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.h2
        className="text-3xl sm:text-4xl font-bold text-white mb-8 sm:mb-12 text-center px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        How Skills Impact Your Staking
      </motion.h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Left: Features */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-3 sm:space-y-4"
        >
          {features.map((item, idx) => (
            <motion.div
              key={idx}
              className="p-3 sm:p-4 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-purple-500/50 transition-colors"
              whileHover={{ x: 5, borderColor: '#A78BFA' }}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="text-xl sm:text-2xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white mb-1 text-sm sm:text-base">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Right: Statistics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-3 sm:space-y-4"
        >
          {skillsByRarity[Rarity.COMMON] && skillsByRarity[Rarity.COMMON].length > 0 && (
            <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-800 rounded-lg">
              <div className="text-xs sm:text-sm text-gray-400 mb-2">COMMON SKILLS</div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {skillsByRarity[Rarity.COMMON].length}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Baseline effects</div>
            </div>
          )}

          {skillsByRarity[Rarity.EPIC] && skillsByRarity[Rarity.EPIC].length > 0 && (
            <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/50 rounded-lg">
              <div className="text-xs sm:text-sm text-purple-300 mb-2">EPIC SKILLS</div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {skillsByRarity[Rarity.EPIC].length}
              </div>
              <div className="text-xs sm:text-sm text-purple-300/70">2.8x effect multiplier</div>
            </div>
          )}

          {skillsByRarity[Rarity.LEGENDARY] && skillsByRarity[Rarity.LEGENDARY].length > 0 && (
            <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-900/30 to-orange-800/10 border border-orange-500/50 rounded-lg">
              <div className="text-xs sm:text-sm text-orange-300 mb-2">LEGENDARY SKILLS</div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {skillsByRarity[Rarity.LEGENDARY].length}
              </div>
              <div className="text-xs sm:text-sm text-orange-300/70">3.5x effect multiplier</div>
            </div>
          )}

          <motion.div
            className="p-4 sm:p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-500/50 rounded-lg"
            animate={{
              boxShadow: [
                '0 0 20px rgba(59, 130, 246, 0)',
                '0 0 20px rgba(59, 130, 246, 0.3)',
                '0 0 20px rgba(59, 130, 246, 0)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="text-xs sm:text-sm text-blue-300 mb-2">MAXIMUM COMBINED BOOST</div>
            <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{totalStakingBoost}%</div>
            <div className="text-xs sm:text-sm text-blue-300/70">with top 3 staking skills active</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
