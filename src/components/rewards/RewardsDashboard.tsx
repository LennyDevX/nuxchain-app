import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { useSolanaWallet } from '../../hooks/web3/useSolanaWallet';
import { useWalletRegistration } from '../../hooks/web3/useWalletRegistration';
import { useRecentActivities } from '../../hooks/activity/useRecentActivitiesGraph';
import { useActivityStats } from '../../hooks/activity/useActivityStats';

const CROSSCHAIN_BENEFITS = [
  { icon: '⛓️', title: 'Dual-Chain Identity', desc: 'Your Polygon wallet is your on-chain identity for DeFi activity. Your Solana wallet is your reward destination. One ecosystem, two chains — seamlessly linked.', color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
  { icon: '⚡', title: 'Zero Gas for Rewards', desc: 'NUX rewards are distributed on Solana — ultra-low fees, sub-second finality. No gas costs to receive your tokens. Rewards arrive automatically each month.', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
  { icon: '🏆', title: 'Activity-Based Rewards', desc: 'Nuxchain rewards real ecosystem participation: staking, NFT trading, skill purchases. Your score is re-evaluated every 30 days — the more you engage, the more you earn.', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
  { icon: '🔒', title: 'No Lock-in', desc: 'Wallet sync is free and off-chain. No transaction needed, no contract approval. You can update your Solana address at any time.', color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5' },
];

const SCORE_WEIGHTS = [
  { label: 'Staking', weight: 40, icon: '💎', color: 'bg-emerald-400', textColor: 'text-emerald-400', desc: 'POL staked × duration' },
  { label: 'NFT Activity', weight: 35, icon: '🎨', color: 'bg-pink-400', textColor: 'text-pink-400', desc: 'Mints, sales & purchases' },
  { label: 'Skills', weight: 25, icon: '⚡', color: 'bg-blue-400', textColor: 'text-blue-400', desc: 'Skill purchases & usage' },
];

const COMPARISONS = [
  { feature: 'Cross-chain rewards', nuxchain: true, others: false },
  { feature: 'Activity-based allocation', nuxchain: true, others: false },
  { feature: 'Zero gas to claim', nuxchain: true, others: false },
  { feature: 'Dual-wallet identity', nuxchain: true, others: false },
  { feature: 'Monthly re-evaluation', nuxchain: true, others: false },
  { feature: 'NFT + Staking + Skills', nuxchain: true, others: false },
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
  const { isConnected: isSolanaConnected, address: solanaAddress, wallet: solanaWalletName } = useSolanaWallet();
  const { isRegistered, registrationData, saveRegistration } = useWalletRegistration(address);
  const { activities, isLoading: activitiesLoading, error: activitiesError, refreshActivities } = useRecentActivities(50);
  const { stats } = useActivityStats();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleLinkWallets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !solanaAddress) return;
    setIsSubmitting(true);
    const ok = await saveRegistration(solanaAddress, solanaWalletName);
    setIsSubmitting(false);
    if (ok) setSubmitted(true);
  };

  const showSuccessState = isRegistered || submitted;

  const filteredActivities = activities.filter(a => activeFilter === 'ALL' || a.type.startsWith(activeFilter));
  const formatTime = (ts: number) => new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className={`space-y-8 ${isMobile ? 'px-4 py-6' : 'px-6 py-8'} max-w-6xl mx-auto`}>

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className={`jersey-15-regular text-gradient mb-3 ${isMobile ? 'text-5xl' : 'text-7xl'}`}>NUX Rewards Hub</h1>
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 jersey-20-regular text-sm font-bold uppercase tracking-widest mb-4">
          🧪 Beta
        </span>
        <p className={`jersey-20-regular text-white/50 max-w-2xl mx-auto ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          Your cross-chain activity dashboard — Polygon identity, Solana rewards.
        </p>
      </motion.div>

      {/* CROSS-CHAIN IDENTITY CARD */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className={`card-unified border ${isRegistered ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10'} ${isMobile ? 'p-5' : 'p-8'}`}>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-4xl">⛓️</span>
          <h2 className={`jersey-15-regular text-white ${isMobile ? 'text-3xl' : 'text-4xl'}`}>Cross-Chain Identity</h2>
          {isRegistered && (
            <span className="ml-auto flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-sm font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" /> Synced
            </span>
          )}
          {!isRegistered && isConnected && (
            <span className="ml-auto flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-sm font-bold">⚠ Not Synced</span>
          )}
        </div>

        {!isConnected ? (
          <div className="text-center py-12">
            <p className="jersey-20-regular text-white/50 text-2xl mb-6">Connect your Polygon wallet to view your identity</p>
            <button
              onClick={() => connect({ connector: injected() })}
              className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black jersey-15-regular text-xl font-bold transition-all hover:scale-105 inline-flex items-center gap-3"
            >
              <span className="text-2xl">👛</span> Connect Polygon Wallet
            </button>
            <p className="jersey-20-regular text-white/30 text-base mt-4">Use MetaMask, Rabby, or any EVM wallet</p>
          </div>
        ) : (
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-purple-400 text-2xl">⬡</span>
                <span className="jersey-20-regular text-purple-400 text-base font-bold uppercase tracking-widest">Polygon Wallet</span>
                <span className="ml-auto text-sm text-purple-300/60">Activity Identity</span>
              </div>
              <p className="font-mono text-white/80 text-base break-all">{address ? truncate(address) : '—'}</p>
              <p className="jersey-20-regular text-white/40 text-sm mt-2">Staking · NFTs · Skills · DeFi</p>
            </div>
            <div className={`rounded-xl border p-5 ${isSolanaConnected || registrationData?.solanaAddress ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-2xl ${isSolanaConnected || registrationData?.solanaAddress ? 'text-emerald-400' : 'text-white/40'}`}>◎</span>
                <span className={`jersey-20-regular text-base font-bold uppercase tracking-widest ${isSolanaConnected || registrationData?.solanaAddress ? 'text-emerald-400' : 'text-white/40'}`}>Solana Wallet</span>
                <span className="ml-auto text-sm text-white/40">Reward Destination</span>
              </div>
              <p className="font-mono text-white/80 text-base break-all">
                {registrationData?.solanaAddress ? truncate(registrationData.solanaAddress) : solanaAddress ? truncate(solanaAddress) : <span className="text-amber-400/70 text-lg">Not linked yet</span>}
              </p>
              <p className="jersey-20-regular text-white/40 text-sm mt-2">NUX token distribution via NuxChain</p>
            </div>
          </div>
        )}

        {isConnected && !showSuccessState && (
          <AnimatePresence>
            {!showLinkForm ? (
              <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                <div>
                  <p className={`jersey-15-regular text-white ${isMobile ? 'text-2xl' : 'text-3xl'}`}>🔗 Link your wallets to start earning NUX</p>
                  <p className="jersey-20-regular text-white/50 text-lg mt-1">Connect Polygon + Solana — free, off-chain, no transaction needed</p>
                </div>
                <button onClick={() => setShowLinkForm(true)}
                  className="flex-shrink-0 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black jersey-15-regular text-xl font-bold transition-all hover:scale-105">
                  Link Wallets
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleLinkWallets} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-6 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                  <p className={`jersey-15-regular text-white ${isMobile ? 'text-2xl' : 'text-3xl'}`}>🔗 Link Wallets & Register</p>
                  <button type="button" onClick={() => setShowLinkForm(false)} className="text-white/30 hover:text-white/60 text-2xl transition-colors">✕</button>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="jersey-20-regular block text-white/50 text-base mb-2">Polygon Wallet (Activity Identity)</label>
                    <div className="w-full px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-white/70 font-mono text-base truncate">
                      {isConnected ? address : <span className="text-red-400 text-lg">Connect Polygon wallet first</span>}
                    </div>
                  </div>
                  <div>
                    <label className="jersey-20-regular block text-white/50 text-base mb-2">
                      Solana Wallet (Reward Destination){isSolanaConnected && solanaWalletName ? ` · ${solanaWalletName}` : ''}
                    </label>
                    {isSolanaConnected ? (
                      <div className="w-full px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-base truncate flex items-center gap-3">
                        <span className="text-xl">✓</span><span className="text-white/70">{solanaAddress}</span>
                      </div>
                    ) : (
                      <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 text-amber-400 text-lg flex items-center gap-3">
                        <span className="text-xl">⚠</span><span className="text-white/50">Connect Solana wallet via the navbar</span>
                      </div>
                    )}
                    <p className="jersey-20-regular text-white/30 text-sm mt-2">Phantom, Solflare, or any Solana wallet</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="jersey-20-regular text-blue-300 text-lg">🔒 Free registration. No transaction needed. Wallets linked off-chain.</p>
                  </div>
                  <button type="submit"
                    disabled={!isConnected || !isSolanaConnected || isSubmitting}
                    className="btn-primary w-full py-4 rounded-xl jersey-15-regular text-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                    {isSubmitting ? (
                      <><motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />Linking...</>
                    ) : <>🔗 Link Wallets & Register</>}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        )}
        {isRegistered && registrationData?.registeredAt && (
          <p className="jersey-20-regular text-white/30 text-sm mt-4 text-right">
            Registered: {registrationData.registeredAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </motion.div>

      {/* MONTHLY REWARDS ENGINE — BETA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className={`card-unified border border-purple-500/20 bg-purple-500/5 ${isMobile ? 'p-5' : 'p-8'}`}>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-4xl">🎯</span>
          <h2 className={`jersey-15-regular text-purple-300 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>Monthly Rewards Engine</h2>
          <span className="ml-auto px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 jersey-20-regular text-sm font-bold uppercase tracking-widest">Beta</span>
        </div>
        <p className={`jersey-20-regular text-white/60 mb-6 ${isMobile ? 'text-lg' : 'text-xl'}`}>
          Every 30 days, Nuxchain evaluates your Polygon activity and calculates a reward score. NUX tokens are distributed monthly to your linked Solana wallet — automatically, no claiming needed. Token not yet launched; this is a preview of the upcoming system.
        </p>
        <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {SCORE_WEIGHTS.map((w, i) => (
            <motion.div key={w.label} className="rounded-xl bg-white/5 border border-white/10 p-5"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.08 }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{w.icon}</span>
                <span className={`jersey-15-regular ${w.textColor} text-xl`}>{w.label}</span>
                <span className={`ml-auto jersey-15-regular ${w.textColor} text-3xl`}>{w.weight}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-3">
                <div className={`h-full rounded-full ${w.color}`} style={{ width: `${w.weight}%` }} />
              </div>
              <p className="jersey-20-regular text-white/40 text-sm">{w.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {[
            { icon: '📅', label: 'Evaluation cycle', value: 'Every 30 days', color: 'text-purple-300' },
            { icon: '👥', label: 'Eligible users', value: 'Linked & active on Polygon', color: 'text-emerald-300' },
            { icon: '🔐', label: 'Security', value: 'walletRegistrations · isActive', color: 'text-blue-300' },
          ].map(item => (
            <div key={item.label} className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="jersey-20-regular text-white/40 text-sm uppercase tracking-wider">{item.label}</p>
                <p className={`jersey-20-regular ${item.color} text-base mt-1`}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ACTIVITY STATS */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-3xl">📊</span>
          <h2 className={`jersey-15-regular text-white ${isMobile ? 'text-3xl' : 'text-4xl'}`}>Polygon Activity Snapshot</h2>
          <span className="jersey-20-regular text-white/30 text-base ml-auto">Used for reward eligibility</span>
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
            <motion.div key={stat.label} className={`rounded-xl border ${stat.bg} ${isMobile ? 'p-4' : 'p-5'} text-center`}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 + i * 0.05 }} whileHover={{ scale: 1.03 }}>
              <span className="text-4xl block mb-2">{stat.icon}</span>
              <p className={`jersey-15-regular ${stat.color} ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{stat.value}</p>
              <p className="jersey-20-regular text-white/40 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ACTIVITY FEED */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className={`flex items-center gap-4 mb-6 ${isMobile ? 'flex-wrap' : ''}`}>
          <div className="flex items-center gap-4">
            <span className="text-3xl">📜</span>
            <h2 className={`jersey-15-regular text-white ${isMobile ? 'text-3xl' : 'text-4xl'}`}>Activity History</h2>
          </div>
          <div className={`flex gap-3 ${isMobile ? '' : 'ml-auto'}`}>
            {FILTER_TABS.map(tab => (
              <button key={tab.value} onClick={() => setActiveFilter(tab.value)}
                className={`px-4 py-2 rounded-xl jersey-20-regular text-base transition-all ${activeFilter === tab.value ? 'bg-white/15 text-white border border-white/20' : 'text-white/40 hover:text-white/70 border border-transparent'}`}>
                {tab.label}
              </button>
            ))}
            <button onClick={refreshActivities} className="px-4 py-2 rounded-xl text-white/40 hover:text-white/70 transition-all text-xl" title="Refresh">↻</button>
          </div>
        </div>
        <div className="card-unified overflow-hidden">
          {!isConnected ? (
            <div className="text-center py-20"><span className="text-7xl block mb-6">🔒</span><p className="jersey-20-regular text-white/40 text-2xl">Connect your Polygon wallet to view activity</p></div>
          ) : activitiesLoading ? (
            <div className="text-center py-20">
              <motion.div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full mx-auto mb-6" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
              <p className="jersey-20-regular text-white/40 text-2xl">Loading activity from The Graph...</p>
            </div>
          ) : activitiesError ? (
            <div className="text-center py-20"><span className="text-7xl block mb-6">⚠️</span><p className="jersey-20-regular text-amber-400/70 text-lg max-w-md mx-auto">{activitiesError}</p></div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-20"><span className="text-7xl block mb-6">🌱</span><p className="jersey-20-regular text-white/40 text-2xl">No activity found yet</p><p className="jersey-20-regular text-white/25 text-lg mt-2">Start staking, minting NFTs, or buying skills to earn rewards</p></div>
          ) : (
            <div className="divide-y divide-white/5">
              <AnimatePresence>
                {filteredActivities.map((activity, i) => (
                  <motion.div key={activity.id} className={`flex items-center gap-5 hover:bg-white/[0.03] transition-colors ${isMobile ? 'p-4' : 'p-5'}`}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-3xl">{activity.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`jersey-20-regular ${activity.color} ${isMobile ? 'text-lg' : 'text-xl'} truncate`}>{activity.description}</p>
                      <p className="jersey-20-regular text-white/30 text-sm mt-1">{formatTime(activity.timestamp)}</p>
                    </div>
                    {activity.txHash && (
                      <a href={`https://polygonscan.com/tx/${activity.txHash}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-white/20 hover:text-white/60 transition-colors text-lg" title="View on Polygonscan">↗</a>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* CROSS-CHAIN BENEFITS */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="flex items-center gap-4 mb-6"><span className="text-3xl">🌐</span><h2 className={`jersey-15-regular text-white ${isMobile ? 'text-3xl' : 'text-4xl'}`}>Why Cross-Chain?</h2></div>
        <div className={`grid gap-5 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {CROSSCHAIN_BENEFITS.map((b, i) => (
            <motion.div key={b.title} className={`rounded-xl border ${b.border} ${b.bg} ${isMobile ? 'p-5' : 'p-6'}`}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.01 }}>
              <div className="flex items-center gap-4 mb-3"><span className="text-4xl">{b.icon}</span><h3 className={`jersey-15-regular ${b.color} ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{b.title}</h3></div>
              <p className={`jersey-20-regular text-white/60 leading-relaxed ${isMobile ? 'text-base' : 'text-lg'}`}>{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* NUXCHAIN VS OTHERS */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <div className="flex items-center gap-4 mb-6"><span className="text-3xl">⚔️</span><h2 className={`jersey-15-regular text-white ${isMobile ? 'text-3xl' : 'text-4xl'}`}>Nuxchain vs Other dApps</h2></div>
        <div className="card-unified overflow-hidden">
          <div className={`grid grid-cols-3 gap-4 border-b border-white/10 ${isMobile ? 'p-4' : 'p-5'}`}>
            <p className="jersey-20-regular text-white/40 text-base">Feature</p>
            <p className="jersey-15-regular text-amber-400 text-center text-base">Nuxchain</p>
            <p className="jersey-20-regular text-white/40 text-center text-base">Others</p>
          </div>
          {COMPARISONS.map((row, i) => (
            <motion.div key={row.feature} className={`grid grid-cols-3 gap-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors ${isMobile ? 'p-4' : 'p-5'}`}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <p className={`jersey-20-regular text-white/70 ${isMobile ? 'text-base' : 'text-lg'}`}>{row.feature}</p>
              <div className="flex justify-center">{row.nuxchain ? <span className="text-emerald-400 text-2xl">✓</span> : <span className="text-red-400/60 text-2xl">✗</span>}</div>
              <div className="flex justify-center">{row.others ? <span className="text-emerald-400/60 text-2xl">✓</span> : <span className="text-red-400/60 text-2xl">✗</span>}</div>
            </motion.div>
          ))}
        </div>
        <p className={`jersey-20-regular text-white/30 text-center mt-6 ${isMobile ? 'text-base' : 'text-lg'}`}>
          Nuxchain is a cross-chain NFT & DeFi platform — Polygon for activity, Solana for token rewards. Loyal users who stake, trade NFTs, and buy skills are rewarded automatically.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className={`card-unified border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-purple-500/5 text-center ${isMobile ? 'p-8' : 'p-10'}`}>
        <h3 className={`jersey-15-regular text-white mb-3 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>Start Earning NUX Rewards</h3>
        <p className={`jersey-20-regular text-white/50 mb-8 max-w-lg mx-auto ${isMobile ? 'text-lg' : 'text-xl'}`}>
          Link your wallets, use Nuxchain services on Polygon, and receive NUX automatically on Solana every month.
        </p>
        <div className={`flex gap-4 justify-center ${isMobile ? 'flex-col' : ''}`}>
          {!showSuccessState && (
            <button onClick={() => { setShowLinkForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black jersey-15-regular text-xl font-bold transition-all hover:scale-105">
              🔗 Link Wallets
            </button>
          )}
          <a href="/staking" className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white jersey-15-regular text-xl transition-colors border border-white/10">💎 Start Staking</a>
          <a href="/nfts" className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white jersey-15-regular text-xl transition-colors border border-white/10">🎨 Explore NFTs</a>
        </div>
      </motion.div>

    </div>
  );
}
