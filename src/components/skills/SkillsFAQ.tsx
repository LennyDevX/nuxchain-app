import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQ_ITEMS } from './config';

export const SkillsFAQ: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <motion.h2
        className="jersey-15-regular text-4xl md:text-5xl text-white mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        Frequently Asked Questions
      </motion.h2>

      <motion.p
        className="jersey-20-regular text-xl md:text-2xl text-gray-300 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Get answers to common questions about Skills NFTs and the Nuxchain ecosystem.
      </motion.p>

      <div className="space-y-4">
        {FAQ_ITEMS.map((item, idx) => (
          <motion.div
            key={idx}
            className="border border-gray-800 rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
          >
            <motion.button
              onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
              className="w-full p-6 bg-gray-900/50 hover:bg-gray-900/80 text-left flex items-center justify-between transition-colors"
              whileHover={{ backgroundColor: 'rgba(30, 30, 30, 1)' }}
            >
              <h3 className="jersey-15-regular text-white text-2xl md:text-3xl pr-4">{item.question}</h3>
              <motion.div
                animate={{ rotate: expandedFAQ === idx ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
              >
                <span className="text-purple-400 text-2xl md:text-3xl">▼</span>
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {expandedFAQ === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-gray-800/30 border-t border-gray-800 jersey-20-regular text-lg md:text-xl text-gray-300">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
