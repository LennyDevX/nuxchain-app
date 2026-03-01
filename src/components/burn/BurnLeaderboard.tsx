/**
 * BurnLeaderboard — Top NUX burners fetched from backend
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BurnEntry {
  wallet: string;
  totalBurned: number;
  lastBurnAt: string;
  txCount: number;
}

function shortWallet(w: string) {
  return `${w.slice(0, 5)}...${w.slice(-4)}`;
}

function medalColor(i: number) {
  if (i === 0) return 'text-amber-400';
  if (i === 1) return 'text-slate-300';
  if (i === 2) return 'text-orange-600';
  return 'text-slate-500';
}

function medal(i: number) {
  if (i === 0) return '🥇';
  if (i === 1) return '🥈';
  if (i === 2) return '🥉';
  return `#${i + 1}`;
}

interface BurnLeaderboardProps {
  refreshKey?: number;
}

export default function BurnLeaderboard({ refreshKey }: BurnLeaderboardProps) {
  const [entries, setEntries] = useState<BurnEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/launchpad/burn-leaderboard')
      .then(r => r.ok ? r.json() : { entries: [] })
      .then(data => setEntries(data.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="card-unified border border-white/10 p-6 text-center">
        <div className="animate-spin text-3xl mb-2">🔥</div>
        <p className="jersey-20-regular text-slate-400">Loading leaderboard...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="card-unified border border-white/10 p-8 text-center space-y-3">
        <div className="text-5xl">🏆</div>
        <p className="jersey-15-regular text-slate-300 text-2xl">No burns yet</p>
        <p className="jersey-20-regular text-slate-500 text-lg">Be the first one to burn NUX and secure your spot!</p>
      </div>
    );
  }

  return (
    <div className="card-unified border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-2">
        <span className="text-xl">🏆</span>
        <span className="jersey-15-regular text-white text-xl">Top Burners</span>
        <span className="jersey-20-regular text-slate-500 text-base ml-auto">{entries.length} wallets</span>
      </div>

      {/* List */}
      <div className="divide-y divide-white/5">
        {entries.map((e, i) => (
          <motion.div
            key={e.wallet}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
          >
            {/* Rank */}
            <span className={`jersey-15-regular text-lg w-8 text-center ${medalColor(i)}`}>
              {medal(i)}
            </span>

            {/* Wallet */}
            <div className="flex-1 min-w-0">
              <p className="jersey-20-regular text-slate-200 text-base">{shortWallet(e.wallet)}</p>
              <p className="jersey-20-regular text-slate-600 text-xs">{e.txCount} burn{e.txCount !== 1 ? 's' : ''}</p>
            </div>

            {/* Amount */}
            <div className="text-right">
              <p className="jersey-15-regular text-orange-400 text-lg font-bold">
                {e.totalBurned >= 1_000_000
                  ? (e.totalBurned / 1_000_000).toFixed(2) + 'M'
                  : e.totalBurned.toLocaleString()}{' '}
                <span className="text-slate-500 text-sm">NUX</span>
              </p>
              <p className="jersey-20-regular text-slate-600 text-xs">
                {new Date(e.lastBurnAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
