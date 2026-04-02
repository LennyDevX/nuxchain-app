import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { useRecentActivities } from '../../hooks/activity/useRecentActivitiesGraph';
import { useActivityStats } from '../../hooks/activity/useActivityStats';

const REWARD_SOURCES = [
  {
    label: 'Staking',
    weight: 40,
    icon: '💎',
    color: 'bg-emerald-400',
    textColor: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    desc: 'POL staked × duration',
  },
  {
    label: 'NFT Activity',
    weight: 35,
    icon: '🎨',
    color: 'bg-pink-400',
    textColor: 'text-pink-400',
    border: 'border-pink-500/20',
    bg: 'bg-pink-500/5',
    desc: 'Mints, sales & purchases',
  },
  {
    label: 'Skills',
    weight: 25,
    icon: '⚡',
    color: 'bg-blue-400',
    textColor: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    desc: 'Skill purchases & usage',
  },
];

const FILTER_TABS = [
  { label: 'All', value: 'ALL' },
  { label: 'Staking', value: 'STAKING' },
  { label: 'NFTs', value: 'NFT' },
  { label: 'Skills', value: 'SKILL' },
];

export default function RewardsDashboard() {
  const isMobile = useIsMobile();
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const { activities, isLoading: activitiesLoading, error: activitiesError, refreshActivities } = useRecentActivities(50);
  const { stats } = useActivityStats();
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filteredActivities = activities.filter(a => activeFilter === 'ALL' || a.type.startsWith(activeFilter));
  const formatTime = (ts: number) => new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className={`space-y-8 ${isMobile ? 'px-4 py-6' : 'px-6 py-8'} max-w-6xl mx-auto`}>

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className={`jersey-15-regular text-gradient mb-3 ${isMobile ? 'text-5xl' : 'text-7xl'}`}>Rewards Dashboard</h1>
        <p className={`jersey-20-regular text-white/50 max-w-2xl mx-auto ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          All your Polygon ecosystem rewards — staking, NFTs & skills — in one place.
        </p>
      </motion.div>

      {/* WALLET BANNER */}
      {!isConnected && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`card-unified border border-purple-500/20 text-center ${isMobile ? 'p-8' : 'p-12'}`}>
          <span className="text-6xl block mb-4">⬡</span>
          <p className={`jersey-15-regular text-white mb-2 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>Connect your Polygon wallet</p>
          <p className="jersey-20-regular text-white/40 text-lg mb-8">View your activity-based rewards across all NuxChain services.</p>
          <button
            onClick={() => connect({ connector: injected() })}
            className="px-8 py-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-white jersey-15-regular text-xl font-bold transition-all hover:scale-105 inline-flex items-center gap-3"
          >
            <span className="text-2xl">👛</span> Connect Wallet
          </button>
          <p className="jersey-20-regular text-white/30 text-sm mt-4">MetaMask, Rabby, Coinbase Wallet, or any EVM wallet</p>
        </motion.div>
      )}

      {/* CONNECTED STATE — WALLET INFO */}
      {isConnected && address && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`card-unified border border-purple-500/20 bg-purple-500/5 ${isMobile ? 'p-5' : 'p-6'}`}>
          <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center gap-6'}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-2xl">⬡</div>
              <div>
                <p className="jersey-20-regular text-purple-300 text-sm uppercase tracking-widest mb-1">Connected Wallet · Polygon</p>
                <p className="font-mono text-white/80 text-base">{isMobile ? truncate(address) : address}</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 ${isMobile ? '' : 'ml-auto'}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span className="jersey-20-regular text-emerald-400 text-sm">Active on Polygon</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* REWARDS BREAKDOWN */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center gap-4 mb-5">
          <span className="text-3xl">🎯</span>
          <h2 className={`jersey-15-regular text-white ${isMobile ? 'text-3xl' : 'text-4xl'}`}>Reward Sources</h2>
          <span className="ml-auto px-3 py-1 rounded-full bg-white/10 border border-white/10 jersey-20-regular text-white/40 text-xs uppercase tracking-widest">Monthly cycle</span>
        </div>
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {REWARD_SOURCES.map((src, i) => (
            <motion.div key={src.label}
              className={`rounded-2xl border ${src.border} ${src.bg} ${isMobile ? 'p-5' : 'p-6'}`}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
              whileHover={{ scale: 1.02 }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{src.icon}</span>
                  <span className={`jersey-15-regular ${src.textColor} text-2xl`}>{src.label}</span>
                </div>
                <span className={`jersey-15-regular ${src.textColor} text-3xl`}>{src.weight}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-3">
                <motion.div
                  className={`h-full rounded-full ${src.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${src.weight}%` }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <p className="jersey-20-regular text-white/40 text-sm">{src.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ACTIVITY SNAPSHOT */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center gap-4 mb-5">
          <span className="text-3xl">📊</span>
          <h2 className={`jersey-15-regular text-white ${isMobile ? 'text-3xl' : 'text-4xl'}`}>Activity Snapshot</h2>
          <span className="jersey-20-regular text-white/30 text-sm ml-auto">Polygon network</span>
        </div>
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-6'}`}>
          {[
            { label: 'Staked', value: `${stats.totalStaked.toFixed(2)} POL`, icon: '💎', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'NFTs Minted', value: stats.nftsMinted, icon: '🎨', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
            { label: 'NFTs Sold', value: stats.nftsSold, icon: '💵', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
            { label: 'NFTs Bought', value: stats.nftsPurchased, icon: '🛒', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'Offers Made', value: stats.offersMade, icon: '💬', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
            { label: 'Total Value', value: `${stats.totalValue.toFixed(2)} POL`, icon: '🏆', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          ].map((stat, i) => (
            <motion.div key={stat.label}
              className={`rounded-xl border ${stat.bg} ${isMobile ? 'p-4' : 'p-5'} text-center`}
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 + i * 0.05 }}
              whileHover={{ scale: 1.04 }}>
              <span className="text-4xl block mb-2">{stat.icon}</span>
              <p className={`jersey-15-regular ${stat.color} ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{stat.value}</p>
              <p className="jersey-20-regular text-white/40 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ACTIVITY FEED */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className={`flex items-center gap-4 mb-5 ${isMobile ? 'flex-wrap' : ''}`}>
          <div className="flex items-center gap-4">
            <span className="text-3xl">📜</span>
            <h2 className={`jersey-15-regular text-white ${isMobile ? 'text-3xl' : 'text-4xl'}`}>Activity History</h2>
          </div>
          <div className={`flex gap-2 ${isMobile ? '' : 'ml-auto'}`}>
            {FILTER_TABS.map(tab => (
              <button key={tab.value} onClick={() => setActiveFilter(tab.value)}
                className={`px-4 py-2 rounded-lg jersey-20-regular text-sm transition-all ${activeFilter === tab.value ? 'bg-white/15 text-white border border-white/20' : 'text-white/40 hover:text-white/70 border border-transparent'}`}>
                {tab.label}
              </button>
            ))}
            <button onClick={refreshActivities} className="px-3 py-2 rounded-lg text-white/40 hover:text-white/70 transition-all text-xl" title="Refresh">↻</button>
          </div>
        </div>
        <div className="card-unified overflow-hidden">
          {!isConnected ? (
            <div className="text-center py-16">
              <span className="text-6xl block mb-4">🔒</span>
              <p className="jersey-20-regular text-white/40 text-xl">Connect your Polygon wallet to view activity</p>
            </div>
          ) : activitiesLoading ? (
            <div className="text-center py-16">
              <motion.div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
              <p className="jersey-20-regular text-white/40 text-xl">Loading on-chain activity…</p>
            </div>
          ) : activitiesError ? (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">⚠️</span>
              <p className="jersey-20-regular text-amber-400/70 text-base max-w-md mx-auto">{activitiesError}</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl block mb-4">🌱</span>
              <p className="jersey-20-regular text-white/40 text-xl">No activity found yet</p>
              <p className="jersey-20-regular text-white/25 text-base mt-2">Stake, mint NFTs, or buy skills to start earning</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              <AnimatePresence>
                {filteredActivities.map((activity, i) => (
                  <motion.div key={activity.id}
                    className={`flex items-center gap-5 hover:bg-white/[0.03] transition-colors ${isMobile ? 'p-4' : 'p-5'}`}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">{activity.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`jersey-20-regular ${activity.color} ${isMobile ? 'text-base' : 'text-lg'} truncate`}>{activity.description}</p>
                      <p className="jersey-20-regular text-white/30 text-xs mt-1">{formatTime(activity.timestamp)}</p>
                    </div>
                    {activity.txHash && (
                      <a href={`https://polygonscan.com/tx/${activity.txHash}`} target="_blank" rel="noopener noreferrer"
                        className="flex-shrink-0 text-white/20 hover:text-white/60 transition-colors text-lg" title="View on Polygonscan">↗</a>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* MIGRATION BANNER — early adopters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className={`card-unified border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-purple-500/10 ${isMobile ? 'p-6' : 'p-8'}`}>
        <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between gap-6'}`}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🚀</span>
              <h3 className={`jersey-15-regular text-amber-300 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Early Adopter Migration</h3>
            </div>
            <p className="jersey-20-regular text-white/50 text-base max-w-xl">
              Were you registered in our Solana airdrop program? Link your Polygon wallet now to be included in the upcoming POL token distribution.
            </p>
          </div>
          <Link to="/id"
            className={`flex-shrink-0 px-7 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black jersey-15-regular text-xl font-bold transition-all hover:scale-105 text-center ${isMobile ? 'w-full' : ''}`}>
            Go to Migration →
          </Link>
        </div>
      </motion.div>

      {/* QUICK ACTIONS */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <div className="flex items-center gap-4 mb-5">
          <span className="text-3xl">⚡</span>
          <h2 className={`jersey-15-regular text-white ${isMobile ? 'text-3xl' : 'text-4xl'}`}>Earn More Rewards</h2>
        </div>
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {[
            { icon: '💎', label: 'Stake POL', desc: 'Earn 40% of your reward score by staking POL.', href: '/staking', color: 'border-emerald-500/20 bg-emerald-500/5', btnColor: 'bg-emerald-500 hover:bg-emerald-400' },
            { icon: '🎨', label: 'Trade NFTs', desc: 'Minting, selling & buying NFTs contributes 35%.', href: '/marketplace', color: 'border-pink-500/20 bg-pink-500/5', btnColor: 'bg-pink-500 hover:bg-pink-400' },
            { icon: '⚡', label: 'Buy Skills', desc: 'Skill purchases & usage drive 25% of your score.', href: '/skills', color: 'border-blue-500/20 bg-blue-500/5', btnColor: 'bg-blue-500 hover:bg-blue-400' },
          ].map((item, i) => (
            <motion.div key={item.label}
              className={`rounded-2xl border ${item.color} ${isMobile ? 'p-5' : 'p-6'} flex flex-col gap-4`}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{item.icon}</span>
                <p className="jersey-15-regular text-white text-2xl">{item.label}</p>
              </div>
              <p className="jersey-20-regular text-white/50 text-base flex-1">{item.desc}</p>
              <a href={item.href}
                className={`text-center px-5 py-3 rounded-xl ${item.btnColor} text-white jersey-20-regular text-base font-bold transition-all hover:scale-105`}>
                {item.label} →
              </a>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
