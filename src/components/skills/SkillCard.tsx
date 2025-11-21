import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RARITY_NAMES } from '../../types/contracts';
import type { SkillData } from './config';

interface SkillCardProps {
  skill: SkillData;
  onClick: (skill: SkillData) => void;
  isCompact?: boolean;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, onClick, isCompact = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (isCompact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full"
      >
        <motion.button
          onClick={() => onClick(skill)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="w-full h-full relative group cursor-pointer overflow-hidden rounded-lg bg-gray-900/50 border border-gray-800 transition-all duration-300 hover:border-opacity-100 p-4 flex flex-col justify-between text-left"
          style={{
            borderColor: isHovered ? skill.color : 'rgb(31, 41, 55)',
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Background glow effect */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            style={{ backgroundColor: skill.color }}
            animate={isHovered ? { opacity: 0.1 } : { opacity: 0 }}
          />

          {/* Compact Content */}
          <div className="relative z-10">
            {/* Icon */}
            <motion.div
              animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
              className="text-2xl mb-2"
            >
              {skill.icon}
            </motion.div>

            {/* Name and Effect - Compact */}
            <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">
              {skill.name.split(' - ')[0]}
            </h4>
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: skill.color }}
            >
              {skill.effectFormatted}
            </p>

            {/* Rarity Badge - Small */}
            <span
              className="inline-block text-xs font-bold px-2 py-1 rounded-full text-white"
              style={{
                backgroundColor: skill.color,
              }}
            >
              {RARITY_NAMES[skill.rarity]}
            </span>
          </div>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (skill.id % 6) * 0.05 }}
      className="h-full"
    >
      <motion.button
        onClick={() => onClick(skill)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full h-full relative group cursor-pointer overflow-hidden rounded-xl bg-gray-900/50 border border-gray-800 transition-all duration-300 hover:border-opacity-100 p-6 flex flex-col justify-between"
        style={{
          borderColor: isHovered ? skill.color : 'rgb(31, 41, 55)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background glow effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          style={{ backgroundColor: skill.color }}
          animate={isHovered ? { opacity: 0.1 } : { opacity: 0 }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon and Rarity */}
          <div className="flex items-start justify-between mb-4">
            <motion.div
              animate={isHovered ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
              className="text-4xl"
            >
              {skill.icon}
            </motion.div>
            <span
              className="text-xs font-bold px-2 py-1 rounded-full text-white"
              style={{
                backgroundColor: skill.color,
              }}
            >
              {RARITY_NAMES[skill.rarity]}
            </span>
          </div>

          {/* Name and Type */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-white mb-1">{skill.name}</h3>
            <p className="text-sm text-gray-400">{skill.effectLabel}</p>
          </div>

          {/* Effect Badge */}
          <motion.div
            className="inline-block px-3 py-1 rounded-lg text-sm font-semibold text-white mb-4"
            style={{
              backgroundColor: `${skill.color}33`,
              border: `1px solid ${skill.color}`,
              color: skill.color,
            }}
            animate={isHovered ? { y: -2 } : { y: 0 }}
          >
            {skill.effectFormatted}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div className="relative z-10 pt-4 border-t border-gray-700/50">
          <p className="text-xs text-gray-500 mb-2">{skill.description}</p>
          <motion.div
            animate={isHovered ? { x: 4 } : { x: 0 }}
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: skill.color }}
          >
            View Details
            <span>→</span>
          </motion.div>
        </motion.div>
      </motion.button>
    </motion.div>
  );
};
