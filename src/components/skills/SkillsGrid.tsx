import React from 'react';
import { motion } from 'framer-motion';
import { Rarity } from '../../types/contracts';
import { SkillCard } from './SkillCard';
import { RARITY_COLOR_MAP, type SkillData } from './config';

interface SkillsGridProps {
  skills: SkillData[];
  onSkillClick: (skill: SkillData) => void;
}

export const SkillsGrid: React.FC<SkillsGridProps> = ({ skills, onSkillClick }) => {
  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.h2
        className="text-4xl font-bold text-white mb-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Explore All Skills
      </motion.h2>

      {/* Skills Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
        }}
      >
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} onClick={onSkillClick} />
        ))}
      </motion.div>

      {/* Rarity Legend */}
      <motion.div
        className="mt-12 card-unified p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-lg font-bold text-white mb-4">Rarity Guide</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[Rarity.COMMON, Rarity.UNCOMMON, Rarity.RARE, Rarity.EPIC, Rarity.LEGENDARY].map(
            (rarity) => (
              <div key={rarity} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: RARITY_COLOR_MAP[rarity] }}
                />
                <span className="text-sm text-gray-300">
                  {rarity === Rarity.COMMON && 'Common'}
                  {rarity === Rarity.UNCOMMON && 'Uncommon'}
                  {rarity === Rarity.RARE && 'Rare'}
                  {rarity === Rarity.EPIC && 'Epic'}
                  {rarity === Rarity.LEGENDARY && 'Legendary'}
                </span>
              </div>
            )
          )}
        </div>
      </motion.div>
    </section>
  );
};
