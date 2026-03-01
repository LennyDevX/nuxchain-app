/**
 * BurnStats — Global NUX burn statistics pulled from on-chain supply
 */
import { motion } from 'framer-motion';
import { NUX_TOTAL_SUPPLY } from '../../hooks/useBurnNux';

interface BurnStatsProps {
  currentSupply: number | null;
  burnedSupply: number;
  burnedPercent: number;
  totalBurners?: number;
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card-unified border ${color} p-5 flex flex-col gap-1 text-center`}
    >
      <p className="jersey-20-regular text-slate-400 text-lg uppercase tracking-wide">{label}</p>
      <p className="jersey-15-regular text-white text-3xl md:text-4xl font-bold">{value}</p>
      {sub && <p className="jersey-20-regular text-slate-500 text-base">{sub}</p>}
    </motion.div>
  );
}

export default function BurnStats({ currentSupply, burnedSupply, burnedPercent, totalBurners }: BurnStatsProps) {
  const supplyDisplay = currentSupply !== null
    ? (currentSupply / 1_000_000).toFixed(2) + 'M'
    : '—';

  const burnedDisplay = burnedSupply > 0
    ? burnedSupply >= 1_000_000
      ? (burnedSupply / 1_000_000).toFixed(3) + 'M'
      : burnedSupply.toLocaleString()
    : '0';

  // Progress bar segments as visual milestones
  const milestones = [
    { label: '1%', pct: 1 },
    { label: '5%', pct: 5 },
    { label: '10%', pct: 10 },
    { label: '20%', pct: 20 },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Original Supply"
          value={`${(NUX_TOTAL_SUPPLY / 1_000_000).toFixed(0)}M`}
          sub="NUX minted"
          color="border-white/10"
        />
        <StatCard
          label="Current Supply"
          value={supplyDisplay}
          sub="NUX circulating"
          color="border-blue-500/30"
        />
        <StatCard
          label="Total Burned"
          value={burnedDisplay}
          sub={`${burnedPercent.toFixed(3)}% destroyed`}
          color="border-red-500/30"
        />
        <StatCard
          label="Burners"
          value={totalBurners !== undefined ? totalBurners.toLocaleString() : '—'}
          sub="community contributors"
          color="border-orange-500/30"
        />
      </div>

      {/* Burn progress bar */}
      <div className="card-unified border border-white/10 p-5 space-y-3">
        <div className="flex justify-between items-center">
          <span className="jersey-20-regular text-slate-300 text-lg">🔥 Community Burn Progress</span>
          <span className="jersey-15-regular text-orange-400 text-xl font-bold">{burnedPercent.toFixed(3)}%</span>
        </div>

        <div className="relative h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-amber-400"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(burnedPercent * 5, 100)}%` }} // scale 20% → full bar
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </div>

        {/* Milestones */}
        <div className="flex justify-between">
          {milestones.map(m => (
            <div key={m.label} className="text-center">
              <div className={`w-1 h-2 mx-auto rounded-full mb-1 ${burnedPercent >= m.pct ? 'bg-orange-400' : 'bg-white/10'}`} />
              <span className={`jersey-20-regular text-xs ${burnedPercent >= m.pct ? 'text-orange-400' : 'text-slate-600'}`}>
                {m.label}
              </span>
            </div>
          ))}
        </div>

        <p className="jersey-20-regular text-slate-500 text-sm text-center">
          Target: burn up to <span className="text-orange-400">20M NUX (20%)</span> over time through community + treasury burns
        </p>
      </div>
    </div>
  );
}
