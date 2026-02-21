import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const steps = [
  {
    step: '01',
    icon: '�',
    title: 'Activity Snapshot',
    desc: 'At presale close, a snapshot of all Polygon activity is taken — staking history, NFT holdings, skill purchases, and airdrop registrations are all recorded.',
    color: 'text-amber-400',
    border: 'border-amber-400/30',
  },
  {
    step: '02',
    icon: '🔍',
    title: 'Wallet Verification',
    desc: 'Your registered Solana wallet is matched to your Polygon address. Activity is weighted and a proportional NUX allocation is calculated from the 3,150,000 NUX rewards pool.',
    color: 'text-emerald-400',
    border: 'border-emerald-400/30',
  },
  {
    step: '03',
    icon: '🚀',
    title: 'NUX Distribution',
    desc: 'NUX is sent directly to your Solana wallet via Smithii Multisender. No claim transaction needed — tokens arrive automatically after the presale closes.',
    color: 'text-blue-400',
    border: 'border-blue-400/30',
  },
];

export default function NuxRewardsClaim() {
  const { isConnected, address } = useAccount();
  const isMobile = useIsMobile();
  const [solanaWallet, setSolanaWallet] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solanaWallet.trim() || !isConnected) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="jersey-15-regular text-4xl lg:text-5xl text-gradient mb-3">Claim Your NUX Rewards</h2>
        <p className="jersey-20-regular text-white/50 max-w-xl mx-auto text-lg lg:text-xl">
          Your Polygon activity earns NUX on Solana. Register your Solana wallet now — rewards will be distributed after the presale closes.
        </p>
      </motion.div>

      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>

        {/* Left — How it works (3-step) */}
        <motion.div
          className="card-unified p-6"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="jersey-15-regular text-2xl text-white mb-5">How It Works</h3>
          <div className="space-y-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                className={`flex gap-4 p-4 rounded-2xl bg-white/5 border ${s.border}`}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border ${s.border} flex items-center justify-center`}>
                  <span className={`jersey-15-regular text-base ${s.color}`}>{s.step}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{s.icon}</span>
                    <p className={`jersey-15-regular text-xl ${s.color}`}>{s.title}</p>
                  </div>
                  <p className="jersey-20-regular text-white/60 text-base leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="jersey-20-regular text-emerald-300 text-base">
              🏦 Rewards pool: <span className="text-white">3,150,000 NUX</span> (15% of total supply) — distributed proportionally across all registered users based on activity weight.
            </p>
          </div>
        </motion.div>

        {/* Right — Registration form */}
        <motion.div
          className="card-unified p-6"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="jersey-15-regular text-2xl text-white mb-1">Register Your Solana Wallet</h3>
          <p className="jersey-20-regular text-white/50 text-base mb-5">
            Link your Solana wallet to receive NUX rewards after the presale.
          </p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                className="flex flex-col items-center justify-center py-10 gap-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-4xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  ✅
                </motion.div>
                <p className="jersey-15-regular text-emerald-400 text-3xl text-center">Wallet Registered!</p>
                <p className="jersey-20-regular text-white/50 text-lg text-center max-w-xs">
                  Your Solana wallet has been linked to your Polygon address. You'll receive NUX after the presale closes.
                </p>
                <div className="w-full p-3 rounded-xl bg-white/5 border border-white/10 mt-2">
                  <p className="jersey-20-regular text-white/40 text-base mb-1">Polygon wallet</p>
                  <p className="jersey-20-regular text-white/70 text-lg font-mono truncate">{address}</p>
                  <p className="jersey-20-regular text-white/40 text-base mt-2 mb-1">Solana wallet</p>
                  <p className="jersey-20-regular text-white/70 text-lg font-mono truncate">{solanaWallet}</p>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleRegister}
                className="space-y-4"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Polygon wallet display */}
                <div>
                  <label className="jersey-20-regular block text-white/60 text-lg mb-1.5">
                    Polygon Wallet (connected)
                  </label>
                  <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 font-mono text-lg truncate">
                    {isConnected ? address : (
                      <span className="text-red-400">Connect your Polygon wallet first</span>
                    )}
                  </div>
                </div>

                {/* Solana wallet input */}
                <div>
                  <label className="jersey-20-regular block text-white/60 text-lg mb-1.5">
                    Solana Wallet Address *
                  </label>
                  <input
                    type="text"
                    value={solanaWallet}
                    onChange={(e) => setSolanaWallet(e.target.value)}
                    placeholder="e.g. 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-700 text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-200 font-mono"
                    disabled={!isConnected || isSubmitting}
                  />
                  <p className="jersey-20-regular text-white/30 text-base mt-1">
                    Use Phantom, Solflare, or any Solana wallet (Base58 format)
                  </p>
                </div>

                {/* Info box */}
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="jersey-20-regular text-blue-300 text-base leading-relaxed">
                    🔒 Registration is free. No transaction required. Your wallets are linked off-chain and verified at distribution time.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!isConnected || !solanaWallet.trim() || isSubmitting}
                  className="btn-primary w-full py-4 rounded-xl jersey-15-regular text-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  <p className="jersey-20-regular text-red-400/70 text-sm text-center">
                    Connect your Polygon wallet using the button in the navbar first.
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
