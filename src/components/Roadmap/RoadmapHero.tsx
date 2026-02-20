/**
 * Roadmap Hero Component
 * Displays hero section with progress stats for roadmap
 */
import React from 'react';
import { motion } from 'framer-motion';
import milestonesDefault, { getCounts, getProgressPercentage } from './milestonesData';

interface RoadmapHeroProps {
  isMobile: boolean;
}

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
            className={`inline-block px-3 py-1 jersey-15-regular tracking-wider text-purple-400 bg-purple-900/20 rounded-full border border-purple-500/30 ${isMobile ? 'text-xs mb-4' : 'text-sm md:text-base mb-6'
              }`}
            whileHover={{ scale: 1.05, borderColor: 'rgb(192, 132, 250)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            Product Roadmap
          </motion.span>
        </motion.div>

        <motion.h1
          className={`jersey-15-regular text-gradient ${isMobile ? 'text-4xl mb-4' : 'text-5xl sm:text-6xl md:text-7xl mb-6'
            }`}
          variants={itemVariants}
        >
          {isMobile ? 'Our Vision' : 'Building the Future of Blockchain'}
        </motion.h1>

        <motion.p
          className={`jersey-20-regular text-slate-300 max-w-3xl mx-auto ${isMobile ? 'text-lg mb-6' : 'text-xl md:text-2xl mb-10'
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
              className={`jersey-15-regular text-green-400 ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
            >
              3
            </motion.div>
            <div className={`jersey-20-regular text-slate-400 ${isMobile ? 'text-xs' : 'text-sm md:text-base'}`}>Phases</div>
          </motion.div>
          <motion.div
            className="card-content p-4"
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <motion.div
              className={`jersey-15-regular text-blue-400 ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.35 }}
            >
              {total}
            </motion.div>
            <div className={`jersey-20-regular text-slate-400 ${isMobile ? 'text-xs' : 'text-sm md:text-base'}`}>Milestones</div>
          </motion.div>
          <motion.div
            className="card-content p-4"
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <motion.div
              className={`jersey-15-regular text-purple-400 ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
            >
              {achieved.length}
            </motion.div>
            <div className={`jersey-20-regular text-slate-400 ${isMobile ? 'text-xs' : 'text-sm md:text-base'}`}>Achieved</div>
          </motion.div>
          <motion.div
            className="card-content p-4"
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <motion.div
              className={`jersey-15-regular text-amber-400 ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.45 }}
            >
              {progress}%
            </motion.div>
            <div className={`jersey-20-regular text-slate-400 ${isMobile ? 'text-xs' : 'text-sm md:text-base'}`}>Progress</div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default RoadmapHero;
