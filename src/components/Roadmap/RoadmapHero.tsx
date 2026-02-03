import React from 'react';
import { motion } from 'framer-motion';

interface RoadmapHeroProps {
  isMobile: boolean;
}

import milestonesDefault, { getCounts, getProgressPercentage } from './milestonesData';

const RoadmapHero: React.FC<RoadmapHeroProps> = ({ isMobile }) => {
  const milestones = milestonesDefault;
  const { achieved } = getCounts(milestones);
  const total = milestones.length;
  const progress = getProgressPercentage(milestones);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className={`relative overflow-hidden ${isMobile ? 'py-12 px-4' : 'py-20 px-4 sm:px-6 lg:px-8'
      }`}>
      <motion.div
        className="relative z-10 max-w-5xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <motion.span
            className={`inline-block px-3 py-1 font-semibold tracking-wider text-purple-400 bg-purple-900/20 rounded-full border border-purple-500/30 ${isMobile ? 'text-xs mb-4' : 'text-xs mb-6'
              }`}
            whileHover={{ scale: 1.05, borderColor: 'rgb(192, 132, 250)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            Product Roadmap
          </motion.span>
        </motion.div>

        <motion.h1
          className={`font-bold text-gradient ${isMobile ? 'text-3xl mb-4' : 'text-4xl sm:text-5xl md:text-6xl mb-6'
            }`}
          variants={itemVariants}
        >
          {isMobile ? 'Our Vision' : 'Building the Future of Blockchain'}
        </motion.h1>

        <motion.p
          className={`text-slate-300 max-w-3xl mx-auto ${isMobile ? 'text-base mb-6' : 'text-xl mb-10'
            }`}
          variants={itemVariants}
        >
          {isMobile
            ? 'Explore our complete roadmap with all phases, milestones, and strategic vision for the Nuxchain ecosystem.'
            : 'Explore our comprehensive development roadmap. From completed milestones to ambitious future goals, discover how we\'re revolutionizing the blockchain ecosystem with AI-powered solutions.'
          }
        </motion.p>

        {/* Stats Row */}
        <motion.div
          className={`grid gap-4 max-w-4xl mx-auto ${isMobile ? 'grid-cols-2' : 'grid-cols-4'
            }`}
          variants={containerVariants}
        >
          <motion.div
            className="card-content p-4"
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <motion.div
              className={`font-bold text-green-400 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
            >
              3
            </motion.div>
            <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Phases</div>
          </motion.div>
          <motion.div
            className="card-content p-4"
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <motion.div
              className={`font-bold text-blue-400 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.35 }}
            >
              {total}
            </motion.div>
            <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Milestones</div>
          </motion.div>
          <motion.div
            className="card-content p-4"
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <motion.div
              className={`font-bold text-purple-400 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
            >
              {achieved.length}
            </motion.div>
            <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Achieved</div>
          </motion.div>
          <motion.div
            className="card-content p-4"
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <motion.div
              className={`font-bold text-amber-400 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.45 }}
            >
              {progress}%
            </motion.div>
            <div className={`text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Progress</div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default RoadmapHero;
