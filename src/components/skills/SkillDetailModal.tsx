import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RARITY_NAMES, SKILL_TYPE_NAMES } from '../../types/contracts';
import type { SkillData } from './config';

interface SkillDetailModalProps {
  skill: SkillData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SkillDetailModal: React.FC<SkillDetailModalProps> = ({ skill, isOpen, onClose }) => {
  if (!skill) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
              >
                ✕
              </motion.button>

              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="text-5xl md:text-6xl">{skill.icon}</div>
                <div>
                  <h2 className="jersey-15-regular text-3xl md:text-4xl text-white">{skill.name}</h2>
                  <span
                    className="jersey-15-regular text-base md:text-lg px-3 py-1 rounded-full mt-2 inline-block"
                    style={{
                      backgroundColor: skill.color,
                      color: 'white',
                    }}
                  >
                    {RARITY_NAMES[skill.rarity]}
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="jersey-20-regular text-sm md:text-base text-gray-400 mb-1">SKILL TYPE</p>
                  <p className="jersey-15-regular text-xl md:text-2xl text-white">{SKILL_TYPE_NAMES[skill.skillType]}</p>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="jersey-20-regular text-sm md:text-base text-gray-400 mb-1">EFFECT</p>
                  <p className="jersey-15-regular text-xl md:text-2xl" style={{ color: skill.color }}>
                    {skill.effectFormatted}
                  </p>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="jersey-20-regular text-sm md:text-base text-gray-400 mb-1">DESCRIPTION</p>
                  <p className="jersey-20-regular text-base md:text-lg text-gray-300">{skill.description}</p>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="jersey-20-regular text-sm md:text-base text-gray-400 mb-1">EFFECT STRENGTH</p>
                  <p className="jersey-15-regular text-xl md:text-2xl text-white">{skill.effectValue}%</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white jersey-20-regular text-base md:text-lg rounded-lg transition-colors"
                  onClick={onClose}
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-4 py-3 text-white jersey-20-regular text-base md:text-lg rounded-lg transition-all"
                  style={{
                    backgroundColor: skill.color,
                    boxShadow: `0 0 20px ${skill.color}80`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 30px ${skill.color}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 20px ${skill.color}80`;
                  }}
                >
                  Purchase Skill
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
