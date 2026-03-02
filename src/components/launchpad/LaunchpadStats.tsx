import { motion } from 'framer-motion';

interface Stats {
  total: { nuxSold: number; solRaised: number; participants: number };
}

const GOAL_SOL = 100;

/** Format NUX amounts: 5000 → "5,000" | 50000 → "50K" | 1500000 → "1.5M" */
function fmtNux(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000)    return `${(n / 1_000).toFixed(0)}K`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/** Format SOL: always 4 decimals, e.g. 0.0750 */
function fmtSol(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

export default function LaunchpadStats({ stats }: { stats: Stats | null }) {
  const solRaised = stats?.total.solRaised ?? 0;
  const goalProgress = Math.min((solRaised / GOAL_SOL) * 100, 100);

  const items = [
    {
      label: 'NUX Sold',
      value: stats ? fmtNux(stats.total.nuxSold) : null,
      icon: '🪙',
      color: 'text-purple-400',
    },
    {
      label: 'SOL Raised',
      value: stats ? fmtSol(stats.total.solRaised) : null,
      suffix: 'SOL',
      icon: '◎',
      color: 'text-emerald-400',
    },
    {
      label: 'Participants',
      value: stats ? stats.total.participants.toLocaleString() : null,
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
            {item.value === null ? (
              <div className="h-8 md:h-10 bg-white/5 rounded-lg animate-pulse mx-auto w-20 mb-1" />
            ) : (
              <div className={`jersey-15-regular text-3xl md:text-5xl ${item.color}`}>
                {item.value}
                {item.suffix && <span className="text-xl md:text-2xl ml-1 text-slate-400">{item.suffix}</span>}
              </div>
            )}
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
            {stats === null ? (
              <div className="h-10 bg-white/5 rounded-lg animate-pulse w-32 mb-1" />
            ) : (
              <p className="jersey-15-regular text-3xl md:text-5xl text-emerald-400">
                {fmtSol(solRaised)}
                <span className="text-lg md:text-2xl text-slate-400 ml-1">/ {GOAL_SOL} SOL</span>
              </p>
            )}
            <p className="jersey-20-regular text-slate-500 text-xl md:text-2xl mt-0.5">
              {stats === null ? '...' : `${goalProgress.toFixed(2)}% reached`}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-4 md:h-5 bg-black/40 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-green-400 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${solRaised > 0 ? Math.max(goalProgress, 0.5) : 0}%` }}
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
