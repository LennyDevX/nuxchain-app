import React from 'react';
import { motion } from 'framer-motion';
import milestonesDefault, { getCounts, getProgressPercentage } from './milestonesData';
import type { Milestone } from './milestonesData';
import { CheckIcon, CalendarIcon, ZapIcon } from '../ui/CustomIcons';

interface MilestonesGridProps {
  isMobile: boolean;
}

const MilestonesGrid: React.FC<MilestonesGridProps> = ({ isMobile }) => {
  const milestones: Milestone[] = milestonesDefault;
  const { achieved: achievedMilestones, inProgress: inProgressMilestones, upcoming: upcomingMilestones, total } = getCounts(milestones);
  const progress = getProgressPercentage(milestones);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Launch: 'bg-green-500/20 text-green-400 border-green-500/30',
      Technology: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Growth: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      Governance: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      Features: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      Innovation: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      Gaming: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      DeFi: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      Business: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    return colors[category] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const renderMilestone = (milestone: Milestone, index: number) => (
    <motion.div
      key={index}
      className={`card-unified transition-all duration-300 relative overflow-hidden group ${isMobile ? 'p-4' : 'p-6'
        }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
      }}
    >
      {/* Status Indicator */}
      <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'}`}>
        {milestone.status === 'achieved' ? (
          <div className={`rounded-full bg-green-500/20 flex items-center justify-center ${isMobile ? 'w-6 h-6' : 'w-8 h-8'
            }`}>
            <CheckIcon className={`text-green-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
          </div>
        ) : (
          <div className={`rounded-full bg-slate-700 flex items-center justify-center ${isMobile ? 'w-6 h-6' : 'w-8 h-8'
            }`}>
            <CalendarIcon className={`text-slate-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
          </div>
        )}
      </div>

      {/* Icon */}
      <div className={`rounded-xl flex items-center justify-center ${isMobile ? 'w-10 h-10 mb-2' : 'w-14 h-14 mb-4'
        } ${milestone.status === 'achieved'
          ? 'bg-green-500/20 text-green-400'
          : milestone.status === 'in-progress'
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-purple-500/20 text-purple-400'
        }`}>
        {isMobile ? (
          milestone.icon
        ) : (
          milestone.icon
        )}
      </div>

      {/* Content */}
      <h4 className={`jersey-15-regular text-white ${isMobile ? 'text-base mb-1' : 'text-xl md:text-2xl mb-2'}`}>
        {milestone.title}
      </h4>
      <p className={`jersey-20-regular text-slate-400 ${isMobile ? 'text-sm leading-tight mb-2' : 'text-base md:text-lg mb-4'}`}>
        {milestone.description}
      </p>

      {/* Footer */}
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'}`}>
        <div className={`flex items-center gap-2 text-slate-500 jersey-20-regular ${isMobile ? 'text-xs' : 'text-sm md:text-base'}`}>
          <CalendarIcon className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>{milestone.date}</span>
        </div>
        <span className={`jersey-20-regular px-2 py-1 text-xs md:text-sm rounded-full border w-fit ${getCategoryColor(milestone.category)}`}>
          {milestone.category}
        </span>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );

  return (
    <div className={`${isMobile ? 'space-y-8' : 'space-y-12'}`}>
      <motion.div
        className="text-center max-w-3xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          className={`jersey-15-regular ${isMobile ? 'mb-2 text-2xl' : 'mb-4 text-4xl md:text-5xl'}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Key Milestones
        </motion.h2>
        <motion.p
          className={`jersey-20-regular text-slate-400 ${isMobile ? 'text-sm' : 'text-lg md:text-xl'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Track our progress through major achievements and upcoming goals that define our journey.
        </motion.p>
      </motion.div>

      {/* Achieved Milestones */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className={`flex items-center gap-3 ${isMobile ? 'mb-4' : 'mb-6'}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={`rounded-full bg-green-500/20 flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-10 h-10'
            }`}>
            <CheckIcon className={`text-green-400 ${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} />
          </div>
          <h3 className={`jersey-15-regular text-green-400 ${isMobile ? 'text-lg' : 'text-2xl md:text-3xl'}`}>
            Achieved Milestones
          </h3>
          <motion.span
            className={`jersey-20-regular px-3 py-1 rounded-full bg-green-900/30 text-green-400 animate-pulse ${isMobile ? 'text-xs' : 'text-sm md:text-base'
              }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            {achievedMilestones.length}
          </motion.span>
        </motion.div>
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
          {achievedMilestones.map((milestone, index) => renderMilestone(milestone, index))}
        </div>
      </motion.div>

      {/* In Progress Milestones */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className={`flex items-center gap-3 ${isMobile ? 'mb-4' : 'mb-6'}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={`rounded-full bg-yellow-500/20 flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-10 h-10'
            }`}>
            <ZapIcon className={`text-yellow-400 ${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} />
          </div>
          <h3 className={`jersey-15-regular text-yellow-400 ${isMobile ? 'text-lg' : 'text-2xl md:text-3xl'}`}>
            In Progress
          </h3>
          <motion.span
            className={`jersey-20-regular px-3 py-1 rounded-full bg-yellow-900/30 text-yellow-400 ${isMobile ? 'text-xs' : 'text-sm md:text-base'
              }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            {inProgressMilestones.length}
          </motion.span>
        </motion.div>
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
          {inProgressMilestones.map((milestone, index) => renderMilestone(milestone, index))}
        </div>
      </motion.div>

      {/* Upcoming Milestones */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className={`flex items-center gap-3 ${isMobile ? 'mb-4' : 'mb-6'}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={`rounded-full bg-purple-500/20 flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-10 h-10'
            }`}>
            <CalendarIcon className={`text-purple-400 ${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} />
          </div>
          <h3 className={`jersey-15-regular text-purple-400 ${isMobile ? 'text-lg' : 'text-2xl md:text-3xl'}`}>
            Upcoming Milestones
          </h3>
          <motion.span
            className={`jersey-20-regular px-3 py-1 rounded-full bg-purple-900/30 text-purple-400 ${isMobile ? 'text-xs' : 'text-sm md:text-base'
              }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            {upcomingMilestones.length}
          </motion.span>
        </motion.div>
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
          {upcomingMilestones.map((milestone, index) => renderMilestone(milestone, index))}
        </div>
      </motion.div>

      {/* Progress Stats */}
      <motion.div
        className=" bg-transparent p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className={`jersey-15-regular text-center text-white ${isMobile ? 'mb-4 text-lg' : 'mb-6 text-2xl md:text-3xl'}`}>
          Overall Progress
        </h3>
        <div className="max-w-4xl mx-auto">
          <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-3'}`}>
            <span className={`jersey-20-regular text-slate-400 ${isMobile ? 'text-sm' : 'text-base md:text-lg'}`}>Roadmap Completion</span>
            <motion.span
              className={`jersey-15-regular text-green-400 ${isMobile ? 'text-base' : 'text-lg md:text-xl'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}
            >
              {progress}%
            </motion.span>
          </div>
          <div className={`w-full bg-slate-800 rounded-full overflow-hidden relative ${isMobile ? 'h-2' : 'h-4'}`}>
            {/* animated gradient fill */}
            <motion.div
              className="rounded-full overflow-hidden absolute left-0 top-0 bottom-0"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: 'linear-gradient(90deg, rgba(34,197,94,1) 0%, rgba(59,130,246,1) 50%, rgba(139,92,246,1) 100%)'
              }}
            >
              {/* subtle moving sheen */}
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 100%)' }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
            {/* track overlay to keep height consistent */}
            <div className="relative w-full h-full" />
          </div>
          <div className={`grid gap-2 mt-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-4'
            }`}>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className={`jersey-15-regular text-green-400 ${isMobile ? 'text-xl' : 'text-3xl md:text-4xl'}`}>
                {achievedMilestones.length}
              </div>
              <div className={`jersey-20-regular text-slate-400 ${isMobile ? 'text-xs' : 'text-sm md:text-base'}`}>Achieved</div>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className={`jersey-15-regular text-yellow-400 ${isMobile ? 'text-xl' : 'text-3xl md:text-4xl'}`}>
                {inProgressMilestones.length}
              </div>
              <div className={`jersey-20-regular text-slate-400 ${isMobile ? 'text-xs' : 'text-sm md:text-base'}`}>In Progress</div>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className={`jersey-15-regular text-purple-400 ${isMobile ? 'text-xl' : 'text-3xl md:text-4xl'}`}>
                {upcomingMilestones.length}
              </div>
              <div className={`jersey-20-regular text-slate-400 ${isMobile ? 'text-xs' : 'text-sm md:text-base'}`}>Upcoming</div>
            </motion.div>
            {!isMobile && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className={`jersey-15-regular text-blue-400 text-3xl md:text-4xl`}>
                  {total}
                </div>
                <div className={`jersey-20-regular text-slate-400 text-sm md:text-base`}>Total</div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MilestonesGrid;
