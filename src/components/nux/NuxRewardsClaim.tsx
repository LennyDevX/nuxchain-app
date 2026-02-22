import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { useSolanaWallet } from '../../hooks/web3/useSolanaWallet';
import { useWalletRegistration } from '../../hooks/web3/useWalletRegistration';
import { Doughnut } from 'react-chartjs-2';
import NuxWelcomeUniverse from './NuxWelcomeUniverse';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const steps = [
  {
    step: '01',
    icon: '🔗',
    title: 'Link Your Wallets',
    desc: 'Connect your Polygon wallet (activity chain) and Solana wallet (rewards chain). Both wallets are linked off-chain — no transaction needed. Your Polygon wallet earns activity points; your Solana wallet receives NUX rewards.',
    color: 'text-purple-400',
    border: 'border-purple-400/30',
  },
  {
    step: '02',
    icon: '📊',
    title: 'Earn Activity Score',
    desc: 'Every on-chain action on Polygon counts toward your NUX Rewards: staking deposits, NFT minting & trading, skill purchases, marketplace activity, and governance participation. The more you engage, the higher your monthly allocation.',
    color: 'text-emerald-400',
    border: 'border-emerald-400/30',
  },
  {
    step: '03',
    icon: '�',
    title: 'Monthly NUX Distribution',
    desc: 'Every 30 days, the NUX Rewards Hub evaluates your activity score and distributes NUX tokens directly to your Solana wallet as SPL tokens. Zero gas fees for recipients. The 20M NUX rewards pool is distributed monthly to active users based on their contribution to the ecosystem.',
    color: 'text-amber-400',
    border: 'border-amber-400/30',
  },
];

export default function NuxRewardsClaim() {
  const { isConnected, address } = useAccount();
  const { isConnected: isSolanaConnected, address: solanaAddress, wallet: solanaWalletName } = useSolanaWallet();
  const { isRegistered, saveRegistration } = useWalletRegistration(address);
  const isMobile = useIsMobile();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use isRegistered from Firebase to determine if we show success state
  const showSuccessState = isRegistered || submitted;

  // Tokenomics chart data
  const tokenomicsData = {
    labels: ['Presale', 'Liquidity', 'Rewards', 'Dev', 'Marketing', 'Ecosystem'],
    datasets: [{
      data: [15, 15, 20, 15, 15, 20],
      backgroundColor: [
        'rgba(251, 191, 36, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(6, 182, 212, 0.8)',
      ],
      borderColor: [
        'rgba(251, 191, 36, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(168, 85, 247, 1)',
        'rgba(6, 182, 212, 1)',
      ],
      borderWidth: 2,
    }],
  };

  const tokenomicsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    cutout: '65%',
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !solanaAddress) return;
    
    setIsSubmitting(true);
    const success = await saveRegistration(solanaAddress, solanaWalletName);
    setIsSubmitting(false);
    
    if (success) {
      setSubmitted(true);
    }
  };

  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`text-center ${isMobile ? 'mb-6' : 'mb-10'}`}
      >
        <h2 className={`jersey-15-regular text-gradient mb-2 ${isMobile ? 'text-4xl' : 'text-7xl'}`}>Claim Your NUX Rewards</h2>
        <p className={`jersey-20-regular text-white/50 max-w-xl mx-auto ${isMobile ? 'text-xl' : 'text-xl'}`}>
          Register your Solana wallet — rewards distributed after presale closes.
        </p>
      </motion.div>

      <div className={`grid gap-5 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-5'}`}>

        {/* Left — How it works (3-step) — wider col */}
        <motion.div
          className={`card-unified ${isMobile ? 'p-4' : 'p-6 lg:col-span-3'}`}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className={`jersey-15-regular text-white mb-4 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>How It Works</h3>

          {/* Steps — compact on mobile */}
          <div className={`space-y-3 ${isMobile ? 'mb-4' : 'mb-5'}`}>
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                className={`flex gap-3 rounded-xl bg-white/5 border ${s.border} ${isMobile ? 'p-3' : 'p-4'}`}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className={`flex-shrink-0 rounded-lg bg-white/5 border ${s.border} flex items-center justify-center ${isMobile ? 'w-9 h-9' : 'w-10 h-10'}`}>
                  <span className={`jersey-15-regular text-2xl  ${s.color}`}>{s.step}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={isMobile ? 'text-lg' : 'text-xl'}>{s.icon}</span>
                    <p className={`jersey-15-regular ${s.color} ${isMobile ? 'text-xl' : 'text-2xl'}`}>{s.title}</p>
                  </div>
                  <p className={`jersey-20-regular text-white/60 leading-snug ${isMobile ? 'text-base' : 'text-lg'}`}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Vesting schedule — compact */}
          <div className={`rounded-xl bg-emerald-500/10 border border-emerald-500/20 ${isMobile ? 'p-3 mb-3' : 'p-4 mb-4'}`}>
            <p className={`jersey-20-regular text-emerald-300 mb-2 ${isMobile ? 'text-xl' : 'text-xl'}`}>
              🏦 Pool: <span className="text-white font-semibold">20,000,000 NUX</span> (20% of 100M)
            </p>
            <div className={`grid grid-cols-3 gap-2 text-center`}>
              {[
                { phase: 'TGE', amount: '10K NUX', date: 'Mar 24', color: 'text-amber-400' },
                { phase: '+3mo', amount: '20K NUX', date: 'Jun 21', color: 'text-emerald-400' },
                { phase: '+6mo', amount: '10K NUX', date: 'Sep 21', color: 'text-blue-400' },
              ].map(p => (
                <div key={p.phase} className="p-2 rounded-lg bg-white/5">
                  <p className={`jersey-20-regular ${p.color} ${isMobile ? 'text-xl' : 'text-xl'}`}>{p.phase}</p>
                  <p className={`jersey-15-regular text-white ${isMobile ? 'text-3xl' : 'text-5xl'}`}>{p.amount}</p>
                  <p className={`jersey-20-regular text-white/40 ${isMobile ? 'text-xl' : 'text-xl'}`}>{p.date}</p>
                </div>
              ))}
            </div>
            <p className={`jersey-20-regular text-white/40 mt-2 pt-2 border-t border-white/10 ${isMobile ? 'text-xl' : 'text-xl'}`}>
              Total: 40,000 NUX per verified user · Smithii Vesting
            </p>
          </div>

          {/* Whitelist price table */}
          <div className={`rounded-xl bg-amber-500/10 border border-amber-500/30 ${isMobile ? 'p-3' : 'p-4'}`}>
            <p className={`jersey-15-regular text-amber-400 mb-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              ⭐ Whitelist Access for Registered Users
            </p>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              {[
                { tier: 'Whitelist', price: '0.000015', date: 'Mar 2-14', min: '5K NUX', color: 'text-amber-400' },
                { tier: 'Presale', price: '0.000025', date: 'Mar 2-22', min: '1K NUX', color: 'text-blue-400' },
                { tier: 'LP/TGE', price: '0.00004', date: 'Mar 24', min: 'Market', color: 'text-emerald-400' },
              ].map(t => (
                <div key={t.tier} className="p-2 rounded-lg bg-white/5">
                  <p className={`jersey-20-regular ${t.color} ${isMobile ? 'text-base' : 'text-lg'}`}>{t.tier}</p>
                  <p className={`jersey-15-regular text-white leading-tight ${isMobile ? 'text-3xl' : 'text-5xl'}`}>{t.price} SOL</p>
                  <p className={`jersey-20-regular text-white/40 ${isMobile ? 'text-sm' : 'text-sm'}`}>{t.date}</p>
                  <p className={`jersey-20-regular text-emerald-400 ${isMobile ? 'text-sm' : 'text-sm'}`}>{t.min}</p>
                </div>
              ))}
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className={`jersey-20-regular text-purple-300 ${isMobile ? 'text-base' : 'text-lg'}`}>
                🏛️ Unsold tokens → treasury hold + additional community rewards
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right — Registration form + Tokenomics Chart — sticky on desktop */}
        <motion.div
          className={`card-unified lg:col-span-2 lg:self-start lg:sticky lg:top-6 ${isMobile ? 'p-4' : 'p-6'}`}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Tokenomics Chart - Compact - Hidden when submitted */}
          {!showSuccessState && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className={isMobile ? 'text-lg' : 'text-xl'}>🥧</span>
                <h4 className={`jersey-15-regular text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>Token Distribution</h4>
              </div>
              <div className={`relative mx-auto ${isMobile ? 'w-32 h-32' : 'w-40 h-40'}`}>
                <Doughnut data={tokenomicsData} options={tokenomicsOptions} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <img
                    src="/assets/tokens/NuxLogo.png"
                    alt="NUX"
                    className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} object-contain drop-shadow-lg`}
                  />
                </div>
              </div>
              <p className={`jersey-20-regular text-white/50 text-center mt-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                100M Total Supply
              </p>
            </div>
          )}

          {!showSuccessState && (
            <>
              <h3 className={`jersey-15-regular text-white mb-1 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Register Solana Wallet</h3>
              <p className={`jersey-20-regular text-white/50 mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>
                Link your wallet to receive NUX after presale.
              </p>
            </>
          )}

          <AnimatePresence mode="wait">
            {showSuccessState ? (
              <NuxWelcomeUniverse key="success" />
            ) : (
              <motion.form
                key="form"
                onSubmit={handleRegister}
                className="space-y-3"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Polygon wallet display */}
                <div>
                  <label className="jersey-20-regular block text-white/60 text-base mb-1">
                    Polygon Wallet (connected)
                  </label>
                  <div className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 font-mono text-base truncate">
                    {isConnected ? address : (
                      <span className="text-red-400 text-base">Connect your Polygon wallet first</span>
                    )}
                  </div>
                </div>

                {/* Solana wallet - Auto-detected */}
                <div>
                  <label className="jersey-20-regular block text-white/60 text-base mb-1">
                    Solana Wallet {isSolanaConnected && solanaWalletName ? `(${solanaWalletName})` : ''}
                  </label>
                  {isSolanaConnected ? (
                    <div className="w-full px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-base truncate flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-white/70">{solanaAddress}</span>
                    </div>
                  ) : (
                    <div className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-amber-500/30 text-amber-400 text-base flex items-center gap-2">
                      <span className="text-amber-400">⚠</span>
                      <span className="text-white/50">Connect your Solana wallet via the navbar</span>
                    </div>
                  )}
                  <p className="jersey-20-regular text-white/30 text-sm mt-1">
                    Phantom, Solflare, or any Solana wallet (auto-detected)
                  </p>
                </div>

                {/* Info box */}
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="jersey-20-regular text-blue-300 text-base leading-relaxed">
                    🔒 Free registration. No transaction needed. Wallets linked off-chain.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!isConnected || !isSolanaConnected || isSubmitting}
                  className="btn-primary w-full py-3 rounded-xl jersey-15-regular text-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      Registering...
                    </>
                  ) : (
                    <>🔗 Link Wallets & Register</>
                  )}
                </button>

                {!isConnected && (
                  <p className="jersey-20-regular text-red-400/70 text-base text-center">
                    Connect your Polygon wallet via the navbar first.
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
