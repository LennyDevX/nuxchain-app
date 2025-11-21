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
      title: 'Instant Activation',
      desc: 'Activate skills to increase rewards immediately',
    },
    {
      icon: '🔄',
      title: 'Auto-Compounding',
      desc: 'Accelerate exponential growth of your investment',
    },
    {
      icon: '🛡️',
      title: 'Enhanced Security',
      desc: 'Reduced lock-up periods with special skills',
    },
    {
      icon: '💎',
      title: 'Premium Rewards',
      desc: 'Exclusive access to rare NFT rewards',
    },
  ];

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.h2
        className="text-4xl font-bold text-white mb-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Staking Impact
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          {features.map((item, idx) => (
            <motion.div
              key={idx}
              className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-purple-500/50 transition-colors"
              whileHover={{ x: 10, borderColor: '#A78BFA' }}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h4 className="font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.desc}</p>
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
          className="space-y-4"
        >
          {skillsByRarity[Rarity.COMMON] && skillsByRarity[Rarity.COMMON].length > 0 && (
            <div className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-800 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">COMMON SKILLS</div>
              <div className="text-3xl font-bold text-white mb-2">
                {skillsByRarity[Rarity.COMMON].length}
              </div>
              <div className="text-sm text-gray-500">+5% effect each</div>
            </div>
          )}

          {skillsByRarity[Rarity.EPIC] && skillsByRarity[Rarity.EPIC].length > 0 && (
            <div className="p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/50 rounded-lg">
              <div className="text-sm text-purple-300 mb-2">EPIC SKILLS</div>
              <div className="text-3xl font-bold text-white mb-2">
                {skillsByRarity[Rarity.EPIC].length}
              </div>
              <div className="text-sm text-purple-300/70">+25% effect each</div>
            </div>
          )}

          {skillsByRarity[Rarity.LEGENDARY] && skillsByRarity[Rarity.LEGENDARY].length > 0 && (
            <div className="p-6 bg-gradient-to-br from-orange-900/30 to-orange-800/10 border border-orange-500/50 rounded-lg">
              <div className="text-sm text-orange-300 mb-2">LEGENDARY SKILLS</div>
              <div className="text-3xl font-bold text-white mb-2">
                {skillsByRarity[Rarity.LEGENDARY].length}
              </div>
              <div className="text-sm text-orange-300/70">+50% effect each</div>
            </div>
          )}

          <motion.div
            className="p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-500/50 rounded-lg"
            animate={{
              boxShadow: [
                '0 0 20px rgba(59, 130, 246, 0)',
                '0 0 20px rgba(59, 130, 246, 0.3)',
                '0 0 20px rgba(59, 130, 246, 0)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="text-sm text-blue-300 mb-2">MAXIMUM COMBINED BOOST</div>
            <div className="text-4xl font-bold text-white">{totalStakingBoost}%</div>
            <div className="text-sm text-blue-300/70">with all skills activated</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
