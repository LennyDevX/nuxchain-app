import { motion } from 'framer-motion';

const allocations = [
  { label: 'Whitelist', pct: 12, amount: '12,000,000', color: 'bg-amber-400', textColor: 'text-amber-400', borderColor: 'border-amber-400/30', desc: 'Tier 1 — Airdrop registrants at 0.000015 SOL/NUX (40% off). Max 200K NUX per wallet. Mar 2–14.' },
  { label: 'Public Presale', pct: 13, amount: '13,000,000', color: 'bg-orange-400', textColor: 'text-orange-400', borderColor: 'border-orange-400/30', desc: 'Tier 2 — Public sale at 0.000025 SOL/NUX. Max 500K NUX per wallet. Mar 15–22.' },
  { label: 'LP Bootstrap', pct: 15, amount: '15,000,000', color: 'bg-blue-400', textColor: 'text-blue-400', borderColor: 'border-blue-400/30', desc: 'NuxChain LP — 50% of SOL raised + equivalent NUX at 0.00004 SOL. LP tokens burned at TGE (Mar 24).' },
  { label: 'Airdrop & Rewards', pct: 15, amount: '15,000,000', color: 'bg-emerald-400', textColor: 'text-emerald-400', borderColor: 'border-emerald-400/30', desc: '40,000 NUX per registered user — 3-phase vesting: 10K at TGE → 20K @ 3mo → 10K @ 6mo.' },
  { label: 'Dev Team', pct: 15, amount: '15,000,000', color: 'bg-pink-400', textColor: 'text-pink-400', borderColor: 'border-pink-400/30', desc: 'Core dev, R&D and platform growth — 12-month cliff + 24-month linear vesting.' },
  { label: 'Marketing', pct: 10, amount: '10,000,000', color: 'bg-purple-400', textColor: 'text-purple-400', borderColor: 'border-purple-400/30', desc: 'Global outreach, KOLs, exchange listings and strategic partnerships.' },
  { label: 'Ecosystem & Treasury', pct: 15, amount: '15,000,000', color: 'bg-cyan-400', textColor: 'text-cyan-400', borderColor: 'border-cyan-400/30', desc: 'Skills marketplace, NFT integrations, AI features, grants and DAO governance releases.' },
  { label: 'Reserve', pct: 5, amount: '5,000,000', color: 'bg-slate-400', textColor: 'text-slate-400', borderColor: 'border-slate-400/30', desc: 'CEX listings, emergency liquidity, future strategic opportunities.' },
];

export default function NuxTokenomics() {
  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="jersey-15-regular text-4xl md:text-8xl text-gradient text-center mb-3">Tokenomics</h2>
        <p className="jersey-20-regular text-white/50 text-center text-xl md:text-3xl mb-8">100,000,000 NUX — Fixed Forever</p>
      </motion.div>

      {/* Bar chart */}
      <motion.div
        className="flex h-6 rounded-full overflow-hidden mb-8 gap-0.5"
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
        style={{ transformOrigin: 'left' }}
      >
        {allocations.map((a) => (
          <div
            key={a.label}
            className={`${a.color} opacity-80 hover:opacity-100 transition-opacity`}
            style={{ width: `${a.pct}%` }}
            title={`${a.label}: ${a.pct}%`}
          />
        ))}
      </motion.div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {allocations.map((a, i) => (
          <motion.div
            key={a.label}
            className={`card-unified p-6 border ${a.borderColor}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`jersey-15-regular text-2xl ${a.textColor}`}>{a.label}</span>
              <span className={`jersey-15-regular text-4xl font-bold ${a.textColor}`}>{a.pct}%</span>
            </div>
            <p className="jersey-20-regular text-white/80 text-lg mb-2">{a.amount} NUX</p>
            <p className="jersey-20-regular text-white/50 text-xl">{a.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Key properties */}
      <motion.div
        className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {[
          { icon: '🔒', title: 'Fixed Supply', desc: 'Mint authority revoked on-chain. 100M forever.' },
          { icon: '🔥', title: 'Non-Burnable', desc: 'No burn mechanism. Scarcity is built-in from genesis.' },
          { icon: '✅', title: 'Auditable', desc: 'All contracts verifiable on Solscan & The Graph.' },
        ].map((item, i) => (
          <div key={i} className="card-unified p-5 flex items-start gap-4">
            <span className="text-3xl">{item.icon}</span>
            <div>
              <p className="jersey-15-regular text-white text-xl lg:text-2xl">{item.title}</p>
              <p className="jersey-20-regular text-white/50 text-xl">{item.desc}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
