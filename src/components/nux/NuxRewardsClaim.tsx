import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { useSolanaWallet } from '../../hooks/web3/useSolanaWallet';
import { useWalletRegistration } from '../../hooks/web3/useWalletRegistration';
import NuxWelcomeUniverse from './NuxWelcomeUniverse';

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
    icon: '💰',
    title: 'Monthly NUX Distribution',
    desc: 'Every 30 days, the NUX Rewards Hub evaluates your activity score and distributes NUX tokens directly to your Solana wallet as SPL tokens. Zero gas fees for recipients. The 15M NUX rewards pool is distributed monthly to active users based on their contribution to the ecosystem.',
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

      <div className={`grid gap-5 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>

        {/* Card 1: How It Works - Steps */}
        <motion.div
          className={`card-unified ${isMobile ? 'p-4' : 'p-6'}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className={`jersey-15-regular text-white mb-4 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>How It Works</h3>

          {/* Steps */}
          <div className="space-y-3">
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
        </motion.div>

        {/* Card 2: Vesting Schedule */}
        <motion.div
          className={`card-unified ${isMobile ? 'p-4' : 'p-6'}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className={`jersey-15-regular text-white mb-4 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Vesting Schedule</h3>
          
          <div className={`rounded-xl bg-emerald-500/10 border border-emerald-500/20 ${isMobile ? 'p-3' : 'p-4'}`}>
            <p className={`jersey-20-regular text-emerald-300 mb-3 ${isMobile ? 'text-xl' : 'text-xl'}`}>
              🏦 Pool: <span className="text-white font-semibold">15,000,000 NUX</span> (15% of 100M)
            </p>
            <div className={`grid grid-cols-3 gap-2 text-center mb-3`}>
              {[
                { phase: 'TGE', amount: '10K', date: 'Mar 24', color: 'text-amber-400' },
                { phase: '+3mo', amount: '20K', date: 'Jun 21', color: 'text-emerald-400' },
                { phase: '+6mo', amount: '10K', date: 'Sep 21', color: 'text-blue-400' },
              ].map(p => (
                <div key={p.phase} className="p-2 rounded-lg bg-white/5">
                  <p className={`jersey-20-regular ${p.color} ${isMobile ? 'text-lg' : 'text-xl'}`}>{p.phase}</p>
                  <p className={`jersey-15-regular text-white ${isMobile ? 'text-2xl' : 'text-4xl'}`}>{p.amount}</p>
                  <p className={`jersey-20-regular text-white/40 ${isMobile ? 'text-sm' : 'text-lg'}`}>{p.date}</p>
                </div>
              ))}
            </div>
            <p className={`jersey-20-regular text-white/50 text-center ${isMobile ? 'text-base' : 'text-lg'} mb-3`}>
              Total: 40,000 NUX per verified user
            </p>
            
            {/* Additional Vesting Details */}
            <div className="space-y-2 pt-3 border-t border-emerald-500/20">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-sm">⏰</span>
                <p className={`jersey-20-regular text-white/60 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  <span className="text-white font-medium">TGE (Mar 24):</span> 25% of rewards unlocked immediately
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-sm">📈</span>
                <p className={`jersey-20-regular text-white/60 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  <span className="text-white font-medium">+3mo (Jun 21):</span> 50% of remaining rewards
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400 text-sm">🎯</span>
                <p className={`jersey-20-regular text-white/60 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  <span className="text-white font-medium">+6mo (Sep 21):</span> Final 25% released
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400 text-sm">🔒</span>
                <p className={`jersey-20-regular text-white/60 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  <span className="text-white font-medium">Smart Vesting:</span> Automatic distribution via smart contracts
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Whitelist Pricing */}
        <motion.div
          className={`card-unified ${isMobile ? 'p-4' : 'p-6'}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className={`jersey-15-regular text-amber-400 mb-4 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>⭐ Whitelist Access</h3>
          
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            {[
              { tier: 'Whitelist', price: '0.000015', date: 'Mar 2-14', max: '200K', color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { tier: 'Presale', price: '0.000025', date: 'Mar 15-22', max: '500K', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { tier: 'LP/TGE', price: '0.00004', date: 'Mar 24', max: 'Market', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            ].map(t => (
              <div key={t.tier} className={`p-2 rounded-lg ${t.bg}`}>
                <p className={`jersey-20-regular ${t.color} ${isMobile ? 'text-sm' : 'text-lg'}`}>{t.tier}</p>
                <p className={`jersey-15-regular text-white leading-tight ${isMobile ? 'text-xl' : 'text-3xl'}`}>{t.price}</p>
                <p className={`jersey-20-regular text-white/50 ${isMobile ? 'text-xs' : 'text-sm'}`}>SOL/NUX</p>
                <p className={`jersey-20-regular text-white/40 ${isMobile ? 'text-xs' : 'text-sm'}`}>{t.date}</p>
                <p className={`jersey-20-regular ${t.color} ${isMobile ? 'text-xs' : 'text-sm'}`}>Max: {t.max}</p>
              </div>
            ))}
          </div>
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className={`jersey-20-regular text-purple-300 ${isMobile ? 'text-sm' : 'text-base'}`}>
              🏛️ Unsold tokens → treasury hold + community rewards
            </p>
          </div>
        </motion.div>

        {/* Card 4: Wallet Registration */}
        <motion.div
          className={`card-unified ${isMobile ? 'p-4' : 'p-6'}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className={`jersey-15-regular text-white mb-1 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Register Wallet</h3>
          <p className={`jersey-20-regular text-white/50 mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>
            Link wallets to receive NUX after presale.
          </p>

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
                  <label className="jersey-20-regular block text-white/60 text-sm mb-1">
                    Polygon Wallet
                  </label>
                  <div className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 font-mono text-sm truncate">
                    {isConnected ? address : (
                      <span className="text-red-400 text-sm">Connect Polygon wallet first</span>
                    )}
                  </div>
                </div>

                {/* Solana wallet - Auto-detected */}
                <div>
                  <label className="jersey-20-regular block text-white/60 text-sm mb-1">
                    Solana Wallet
                  </label>
                  {isSolanaConnected ? (
                    <div className="w-full px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-sm truncate flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-white/70">{solanaAddress}</span>
                    </div>
                  ) : (
                    <div className="w-full px-3 py-2 rounded-xl bg-white/5 border border-amber-500/30 text-amber-400 text-sm flex items-center gap-2">
                      <span className="text-amber-400">⚠</span>
                      <span className="text-white/50">Connect via navbar</span>
                    </div>
                  )}
                </div>

                {/* Info box */}
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="jersey-20-regular text-blue-300 text-sm">
                    🔒 Free registration. No gas fees.
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
                    <>🔗 Link & Register</>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
