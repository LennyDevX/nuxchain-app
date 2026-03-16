import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import milestonesDefault, { getCounts, getProgressPercentage } from './milestonesData';
import type { Milestone } from './milestonesData';
import { CheckIcon, CalendarIcon, ZapIcon } from '../ui/CustomIcons';

interface MilestonesGridProps {
  isMobile: boolean;
}

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
    Marketing: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    'Cross-Chain': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    AI: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
  };
  return colors[category] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
};

const getStatusGlow = (status: Milestone['status']) => {
  if (status === 'achieved') return 'shadow-green-500/20';
  if (status === 'in-progress') return 'shadow-yellow-500/20';
  return 'shadow-purple-500/10';
};

const getNodeColor = (status: Milestone['status']) => {
  if (status === 'achieved') return 'bg-green-500 border-green-400';
  if (status === 'in-progress') return 'bg-yellow-500 border-yellow-400';
  return 'bg-slate-700 border-slate-500';
};

const getNodeRingColor = (status: Milestone['status']) => {
  if (status === 'achieved') return 'ring-green-500/30';
  if (status === 'in-progress') return 'ring-yellow-500/30';
  return 'ring-purple-500/20';
};

type FilterType = 'all' | 'achieved' | 'in-progress' | 'upcoming';

// --- Timeline Node Card ---
const TimelineCard: React.FC<{
  milestone: Milestone;
  index: number;
  isMobile: boolean;
}> = ({ milestone, index, isMobile }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className={`relative`}
      initial={{ opacity: 0, x: isMobile ? -16 : 0, y: isMobile ? 0 : 12 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={`card-unified group cursor-pointer shadow-lg ${getStatusGlow(milestone.status)} ${isMobile ? 'p-3' : 'p-5'} ${expanded ? 'ring-1 ring-white/10' : ''}`}
        onClick={() => setExpanded(v => !v)}
        whileHover={{ y: -4, scale: 1.015 }}
        transition={{ duration: 0.2 }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl flex items-center justify-center flex-shrink-0 ${isMobile ? 'w-9 h-9' : 'w-11 h-11'} ${milestone.status === 'achieved' ? 'bg-green-500/20 text-green-400' : milestone.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-purple-500/20 text-purple-400'}`}>
              {milestone.icon}
            </div>
            <div>
              <h4 className={`jersey-15-regular text-white leading-tight ${isMobile ? 'text-base' : 'text-lg md:text-xl'}`}>
                {milestone.title}
              </h4>
              <div className={`flex items-center gap-1.5 mt-0.5 text-slate-500 jersey-20-regular ${isMobile ? 'text-sm' : 'text-base'}`}>
                <CalendarIcon className="w-3 h-3" />
                <span>{milestone.date}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`jersey-20-regular px-2 py-0.5 text-xs md:text-sm rounded-full border w-fit ${getCategoryColor(milestone.category)}`}>
              {milestone.category}
            </span>
            <motion.span
              className="text-slate-600 text-xs select-none"
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▼
            </motion.span>
          </div>
        </div>

        {/* Expandable description */}
        <AnimatePresence>
          {expanded && (
            <motion.p
              className={`jersey-20-regular text-slate-400 leading-relaxed ${isMobile ? 'text-sm' : 'text-base md:text-lg'}`}
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.25 }}
            >
              {milestone.description}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Hover shimmer */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </motion.div>
    </motion.div>
  );
};

// --- Timeline Node Dot ---
const NodeDot: React.FC<{ status: Milestone['status']; delay?: number }> = ({ status, delay = 0 }) => (
  <motion.div
    className={`w-5 h-5 rounded-full border-2 ring-4 relative flex-shrink-0 ${getNodeColor(status)} ${getNodeRingColor(status)}`}
    initial={{ scale: 0 }}
    whileInView={{ scale: 1 }}
    viewport={{ once: true }}
    transition={{ type: 'spring', stiffness: 300, delay }}
  >
    {status === 'achieved' && <CheckIcon className="w-3 h-3 text-white absolute inset-0 m-auto" />}
    {status === 'in-progress' && (
      <motion.div
        className="w-2 h-2 rounded-full bg-yellow-300 absolute inset-0 m-auto"
        animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
    )}
  </motion.div>
);

// --- Section Timeline ---
interface SectionProps {
  milestones: Milestone[];
  isMobile: boolean;
  label: string;
  labelColor: string;
  lineColor: string;
  icon: React.ReactNode;
  count: number;
  countBg: string;
}

const TimelineSection: React.FC<SectionProps> = ({
  milestones, isMobile, label, labelColor, lineColor, icon, count, countBg,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    {/* Section header */}
    <motion.div
      className={`flex items-center gap-3 ${isMobile ? 'mb-5' : 'mb-8'}`}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className={`rounded-full flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-10 h-10'} ${countBg}`}>
        {icon}
      </div>
      <h3 className={`jersey-15-regular ${labelColor} ${isMobile ? 'text-2xl' : 'text-2xl md:text-3xl'}`}>
        {label}
      </h3>
      <motion.span
        className={`jersey-20-regular px-3 py-1 rounded-full ${countBg} ${labelColor} ${isMobile ? 'text-base' : 'text-lg md:text-xl'}`}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
      >
        {count}
      </motion.span>
    </motion.div>

    {/* Timeline */}
    {isMobile ? (
      <div className="relative pl-8">
        <div className={`absolute left-[9px] top-0 bottom-0 w-0.5 ${lineColor} rounded-full`} />
        <div className="space-y-4">
          {milestones.map((m, i) => (
            <div key={i} className="relative flex items-start gap-4">
              <div className="absolute -left-8 top-4">
                <NodeDot status={m.status} delay={i * 0.04 + 0.2} />
              </div>
              <div className="flex-1">
                <TimelineCard milestone={m} index={i} isMobile={true} />
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="relative">
        {/* Vertical spine */}
        <div className={`absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 ${lineColor} rounded-full`} />
        <div className="space-y-6">
          {milestones.map((m, i) => (
            <div key={i} className="grid grid-cols-[1fr_40px_1fr] items-start gap-0">
              {/* Left or empty */}
              {i % 2 === 0 ? (
                <div className="pr-8">
                  <TimelineCard milestone={m} index={i} isMobile={false} />
                </div>
              ) : (
                <div />
              )}
              {/* Center node */}
              <div className="flex justify-center pt-5">
                <NodeDot status={m.status} delay={i * 0.04 + 0.2} />
              </div>
              {/* Right or empty */}
              {i % 2 !== 0 ? (
                <div className="pl-8">
                  <TimelineCard milestone={m} index={i} isMobile={false} />
                </div>
              ) : (
                <div />
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </motion.div>
);

// --- Main Component ---
const MilestonesGrid: React.FC<MilestonesGridProps> = ({ isMobile }) => {
  const milestones: Milestone[] = milestonesDefault;
  const { achieved: achievedMilestones, inProgress: inProgressMilestones, upcoming: upcomingMilestones, total } = getCounts(milestones);
  const progress = getProgressPercentage(milestones);
  const [filter, setFilter] = useState<FilterType>('all');

  const filterButtons: { key: FilterType; label: string; active: string }[] = [
    { key: 'all', label: 'All', active: 'bg-slate-700 text-white' },
    { key: 'achieved', label: '✓ Achieved', active: 'bg-green-500/20 text-green-400 border border-green-500/40' },
    { key: 'in-progress', label: '⚡ In Progress', active: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' },
    { key: 'upcoming', label: '◆ Upcoming', active: 'bg-purple-500/20 text-purple-400 border border-purple-500/40' },
  ];

  const showAchieved = filter === 'all' || filter === 'achieved';
  const showInProgress = filter === 'all' || filter === 'in-progress';
  const showUpcoming = filter === 'all' || filter === 'upcoming';

  return (
    <div className={`${isMobile ? 'space-y-10' : 'space-y-16'}`}>

      {/* Header */}
      <motion.div
        className="text-center max-w-3xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          className={`jersey-15-regular text-gradient ${isMobile ? 'mb-3 text-3xl' : 'mb-4 text-4xl md:text-7xl'}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Platform Route Map
        </motion.h2>
        <motion.p
          className={`jersey-20-regular text-slate-400 ${isMobile ? 'text-lg' : 'text-xl md:text-2xl'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Every milestone in our journey — from the first line of code to a cross-chain AI ecosystem.
        </motion.p>
      </motion.div>

      {/* Progress Overview Banner */}
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/80 to-slate-800/40 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 pointer-events-none" />
        <div className={`relative z-10 ${isMobile ? 'p-5' : 'p-8'}`}>
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-5 items-center'}`}>
            <div className={`${isMobile ? 'grid grid-cols-3 gap-4' : 'col-span-4 grid grid-cols-4 gap-4'}`}>
              <div className="text-center">
                <motion.div className={`jersey-15-regular text-green-400 ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'}`} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}>{achievedMilestones.length}</motion.div>
                <div className={`jersey-20-regular text-slate-400 ${isMobile ? 'text-sm' : 'text-base md:text-lg'}`}>Achieved</div>
              </div>
              <div className="text-center">
                <motion.div className={`jersey-15-regular text-yellow-400 ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'}`} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}>{inProgressMilestones.length}</motion.div>
                <div className={`jersey-20-regular text-slate-400 ${isMobile ? 'text-sm' : 'text-base md:text-lg'}`}>In Progress</div>
              </div>
              <div className="text-center">
                <motion.div className={`jersey-15-regular text-purple-400 ${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'}`} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}>{upcomingMilestones.length}</motion.div>
                <div className={`jersey-20-regular text-slate-400 ${isMobile ? 'text-sm' : 'text-base md:text-lg'}`}>Upcoming</div>
              </div>
              {!isMobile && (
                <div className="text-center">
                  <motion.div className="jersey-15-regular text-blue-400 text-4xl md:text-5xl" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.6 }}>{total}</motion.div>
                  <div className="jersey-20-regular text-slate-400 text-base md:text-lg">Total</div>
                </div>
              )}
            </div>
            {!isMobile && (
              <div className="col-span-1 flex flex-col items-center gap-2">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <motion.circle cx="40" cy="40" r="32" fill="none" stroke="url(#progGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 32}`} strokeDashoffset={2 * Math.PI * 32 * (1 - progress / 100)} initial={{ strokeDashoffset: 2 * Math.PI * 32 }} animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - progress / 100) }} transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }} transform="rotate(-90 40 40)" />
                  <defs>
                    <linearGradient id="progGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <text x="40" y="45" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">{progress}%</text>
                </svg>
                <span className="jersey-20-regular text-slate-400 text-sm">Complete</span>
              </div>
            )}
          </div>
          <div className="mt-6">
            <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden relative ${isMobile ? 'h-2' : 'h-3'}`}>
              <motion.div className="rounded-full overflow-hidden absolute left-0 top-0 bottom-0" initial={{ width: '0%' }} animate={{ width: `${progress}%` }} transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }} style={{ background: 'linear-gradient(90deg, #22c55e 0%, #3b82f6 50%, #8b5cf6 100%)' }}>
                <motion.div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.0) 100%)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
              </motion.div>
            </div>
            {isMobile && (
              <div className="flex justify-between mt-1.5">
                <span className="jersey-20-regular text-slate-500 text-sm">0%</span>
                <span className="jersey-15-regular text-white text-sm">{progress}% Complete</span>
                <span className="jersey-20-regular text-slate-500 text-sm">100%</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Filter tabs */}
      <motion.div className={`flex flex-wrap gap-2 justify-center`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        {filterButtons.map(btn => (
          <motion.button key={btn.key} onClick={() => setFilter(btn.key)} className={`jersey-20-regular px-4 py-2 rounded-full text-base md:text-lg transition-all duration-200 border border-transparent ${filter === btn.key ? btn.active : 'text-slate-500 hover:text-slate-300 hover:border-white/10'}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            {btn.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Achieved Milestones */}
      <AnimatePresence>
        {showAchieved && (
          <motion.div key="achieved" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
            <TimelineSection milestones={achievedMilestones} isMobile={isMobile} label="Achieved Milestones" labelColor="text-green-400" lineColor="bg-green-500/30" icon={<CheckIcon className={`text-green-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />} count={achievedMilestones.length} countBg="bg-green-500/20" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* In Progress Milestones */}
      <AnimatePresence>
        {showInProgress && (
          <motion.div key="in-progress" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
            <TimelineSection milestones={inProgressMilestones} isMobile={isMobile} label="In Progress" labelColor="text-yellow-400" lineColor="bg-yellow-500/30" icon={<ZapIcon className={`text-yellow-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />} count={inProgressMilestones.length} countBg="bg-yellow-500/20" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Milestones */}
      <AnimatePresence>
        {showUpcoming && (
          <motion.div key="upcoming" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
            <TimelineSection milestones={upcomingMilestones} isMobile={isMobile} label="Upcoming Milestones" labelColor="text-purple-400" lineColor="bg-purple-500/30" icon={<CalendarIcon className={`text-purple-400 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />} count={upcomingMilestones.length} countBg="bg-purple-500/20" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cross-chain AI callout */}
      <motion.div className="relative overflow-hidden rounded-2xl border border-fuchsia-500/20" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ background: 'linear-gradient(135deg, rgba(192,38,211,0.08) 0%, rgba(109,40,217,0.08) 50%, rgba(59,130,246,0.06) 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(192,38,211,0.12) 0%, transparent 60%)' }} />
        <div className={`relative z-10 ${isMobile ? 'p-5' : 'p-8'} text-center`}>
          <div className={`jersey-20-regular text-fuchsia-400 tracking-widest uppercase ${isMobile ? 'text-sm mb-2' : 'text-base mb-3'}`}>Our Vision</div>
          <h3 className={`jersey-15-regular text-white ${isMobile ? 'text-2xl mb-3' : 'text-3xl md:text-4xl mb-4'}`}>Cross-Chain AI Platform</h3>
          <p className={`jersey-20-regular text-slate-400 max-w-2xl mx-auto ${isMobile ? 'text-base' : 'text-lg md:text-xl'}`}>
            Nuxchain is evolving into the leading cross-chain AI infrastructure — connecting blockchains, powering intelligent agents, and giving every user an AI-driven edge in Web3.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-5">
            {['Cross-Chain', 'AI Agents', 'DeFi Intelligence', 'On-Chain Automation', 'Unified Wallet AI'].map(tag => (
              <span key={tag} className="jersey-20-regular px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-sm">{tag}</span>
            ))}
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default MilestonesGrid;

