import { motion } from 'framer-motion';

interface Stats {
  total: { nuxSold: number; solRaised: number; participants: number };
}

const GOAL_SOL = 100;

export default function LaunchpadStats({ stats }: { stats: Stats | null }) {
  const solRaised = stats?.total.solRaised ?? 0;
  const goalProgress = Math.min((solRaised / GOAL_SOL) * 100, 100);

  const items = [
    {
      label: 'NUX Sold',
      value: stats ? `${(stats.total.nuxSold / 1_000_000).toFixed(2)}M` : '—',
      icon: '🪙',
      color: 'text-purple-400',
    },
    {
      label: 'SOL Raised',
      value: stats ? `${stats.total.solRaised.toFixed(2)}` : '—',
      suffix: 'SOL',
      icon: '◎',
      color: 'text-emerald-400',
    },
    {
      label: 'Participants',
      value: stats ? stats.total.participants.toLocaleString() : '—',
      icon: '👥',
      color: 'text-blue-400',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card-unified border border-white/10 p-4 md:p-5 text-center"
          >
            <div className="text-2xl md:text-3xl mb-1">{item.icon}</div>
            <div className={`jersey-15-regular text-3xl md:text-5xl ${item.color}`}>
              {item.value}
              {item.suffix && <span className="text-xl md:text-2xl ml-1 text-slate-400">{item.suffix}</span>}
            </div>
            <div className="jersey-20-regular text-slate-500 text-xl md:text-2xl uppercase tracking-wide mt-1">
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fundraising Goal Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-unified border border-emerald-500/20 p-4 md:p-6 space-y-3"
      >
        {/* Goal header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl md:text-2xl">🎯</span>
            <div>
              <p className="jersey-15-regular text-white text-xl md:text-2xl">Fundraising Goal</p>
              <p className="jersey-20-regular text-slate-500 text-xl md:text-2xl    ">Community target — every SOL counts</p>
            </div>
          </div>
          <div className="text-right">
            <p className="jersey-15-regular text-3xl md:text-5xl text-emerald-400">
              {solRaised.toFixed(2)}
              <span className="text-lg md:text-2xl text-slate-400 ml-1">/ {GOAL_SOL} SOL</span>
            </p>
            <p className="jersey-20-regular text-slate-500 text-xl md:text-2xl mt-0.5">
              {goalProgress.toFixed(1)}% reached
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-4 md:h-5 bg-black/40 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${goalProgress}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>

        {/* Liquidity lock callout */}
        <div className="flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5">
          <span className="text-2xl md:text-3xl">🔒</span>
          <p className="jersey-20-regular text-amber-300 text-xl md:text-2xl text-center">
            <span className="text-amber-200 font-semibold">50% of all liquidity will be permanently locked</span>
            {' '}— protecting holders from rug pulls at launch.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
