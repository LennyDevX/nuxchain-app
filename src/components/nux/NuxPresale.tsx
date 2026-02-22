import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const phases = [
  {
    step: '01',
    title: 'Token Creation',
    desc: 'NUX SPL token deployed on Solana. 100M supply, mint authority revoked — fixed forever.',
    icon: '🪙',
    color: 'text-amber-400',
    border: 'border-amber-400/30',
    status: 'upcoming',
  },
  {
    step: '02',
    title: 'Whitelist Phase',
    desc: 'Exclusive access for airdrop registrants at 0.000015 SOL/NUX (cheapest, 40% off). Min: 5,000 NUX. Mar 2-14.',
    icon: '📋',
    color: 'text-amber-500',
    border: 'border-amber-500/30',
    status: 'upcoming',
  },
  {
    step: '03',
    title: 'Public Presale',
    desc: 'Open presale on Smithii Launchpad at 0.000025 SOL/NUX. 15M NUX allocation. Min: 1,000 NUX. Mar 2-22.',
    icon: '🚀',
    color: 'text-purple-400',
    border: 'border-purple-400/30',
    status: 'upcoming',
  },
  {
    step: '04',
    title: 'TGE & LP Creation',
    desc: 'Liquidity Pool created on Raydium with presale funds. LP tokens burned. Market price 0.00004 SOL. Mar 24.',
    icon: '📈',
    color: 'text-emerald-400',
    border: 'border-emerald-400/30',
    status: 'upcoming',
  },
  {
    step: '05',
    title: 'Airdrop Distribution',
    desc: '40,000 NUX per registered user via 3-phase vesting: 10K at TGE (Mar 24), 20K after 3 months (Jun 24), 10K after 6 months (Sep 24).',
    icon: '🎁',
    color: 'text-pink-400',
    border: 'border-pink-400/30',
    status: 'upcoming',
  },
  {
    step: '06',
    title: 'Full Integration',
    desc: 'NUX accepted for skills, NFTs, and AI features across the NuxChain platform on Polygon.',
    icon: '🔗',
    color: 'text-cyan-400',
    border: 'border-cyan-400/30',
    status: 'upcoming',
  },
];

const presaleDetails = [
  { label: 'Total Supply', value: '100,000,000 NUX', highlight: true },
  { label: 'Presale Allocation', value: '15,000,000 NUX (15%)', highlight: false },
  { label: 'Whitelist Price', value: '0.000015 SOL (40% off)', highlight: true },
  { label: 'Whitelist Min', value: '5,000 NUX', highlight: false },
  { label: 'Presale Price', value: '0.000025 SOL', highlight: false },
  { label: 'Presale Min', value: '1,000 NUX', highlight: false },
  { label: 'LP/TGE Price', value: '0.00004 SOL', highlight: true },
  { label: 'Blockchain', value: 'Solana (SPL Token)', highlight: false },
  { label: 'Launchpad', value: 'Smithii Token Launchpad', highlight: false },
  { label: 'Liquidity Lock', value: 'LP tokens burned at TGE', highlight: false },
];

export default function NuxPresale() {
  const isMobile = useIsMobile();

  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`text-center ${isMobile ? 'mb-6' : 'mb-10'}`}
      >
        <h2 className={`jersey-15-regular text-gradient mb-2 ${isMobile ? 'text-4xl' : 'text-7xl'}`}>Presale & Launch Roadmap</h2>
        <p className={`jersey-20-regular text-white/50 ${isMobile ? 'text-xl' : 'text-xl'}`}>From token creation to full ecosystem integration</p>
      </motion.div>

      <div className={`grid gap-5 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-12'}`}>

        {/* Left — Timeline (phases) - now narrower */}
        <div className={`space-y-3 ${isMobile ? '' : 'lg:col-span-5'}`}>
          {phases.map((phase, i) => (
            <motion.div
              key={phase.step}
              className={`flex gap-3 rounded-xl bg-white/5 border ${phase.border} relative overflow-hidden ${isMobile ? 'p-3' : 'p-4'}`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className={`flex-shrink-0 rounded-lg bg-white/5 border ${phase.border} flex items-center justify-center ${isMobile ? 'w-9 h-9' : 'w-10 h-10'}`}>
                <span className={`jersey-15-regular text-base ${phase.color}`}>{phase.step}</span>
              </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={isMobile ? 'text-xl' : 'text-2xl'}>{phase.icon}</span>
                    <h3 className={`jersey-15-regular ${phase.color} ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{phase.title}</h3>
                  </div>
                  <p className={`jersey-20-regular text-white/50 leading-snug ${isMobile ? 'text-lg' : 'text-xl'}`}>{phase.desc}</p>
                </div>
              {i < phases.length - 1 && (
                <div className="absolute left-6 bottom-0 w-0.5 h-3 bg-white/10 translate-y-full" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Right — 3-Tier Launch Benefits + Details - now wider */}
        <div className={`space-y-4 ${isMobile ? '' : 'lg:col-span-7'}`}>
          {/* 3-Tier Launch Benefits - Full Width */}
          <motion.div
            className={`card-unified border border-amber-500/20 bg-amber-500/5 ${isMobile ? 'p-4' : 'p-5'}`}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className={isMobile ? 'text-lg' : 'text-xl'}>⭐</span>
              <h3 className={`jersey-15-regular text-amber-400 ${isMobile ? 'text-xl' : 'text-2xl'}`}>3-Tier Launch Benefits</h3>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              {[
                { tier: 'Whitelist', price: '0.000015', date: 'Mar 2-14', min: '5K NUX', tc: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { tier: 'Presale', price: '0.000025', date: 'Mar 2-22', min: '1K NUX', tc: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                { tier: 'LP/TGE', price: '0.00004', date: 'Mar 24', min: 'Market', tc: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              ].map(t => (
                <motion.div 
                  key={t.tier} 
                  className={`rounded-lg border ${t.bg} ${isMobile ? 'p-2' : 'p-4'}`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className={`jersey-15-regular ${t.tc} ${isMobile ? 'text-base' : 'text-lg'}`}>{t.tier}</p>
                  <p className={`jersey-20-regular text-white font-bold leading-tight ${isMobile ? 'text-xl' : 'text-3xl'}`}>{t.price}</p>
                  <p className={`jersey-20-regular text-white/60 ${isMobile ? 'text-sm' : 'text-base'}`}>SOL</p>
                  <p className={`jersey-20-regular text-white/40 mt-1 ${isMobile ? 'text-sm' : 'text-base'}`}>{t.date}</p>
                  <p className={`jersey-20-regular text-emerald-400 ${isMobile ? 'text-sm' : 'text-base'}`}>{t.min}</p>
                </motion.div>
              ))}
            </div>

            {/* Benefits list - 2 columns on desktop */}
            <div className={`grid gap-2 mb-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {[
                { icon: '🎯', text: 'Airdrop registrants → Whitelist at 0.000015 SOL' },
                { icon: '⛓️', text: 'POL stakers → Whitelist priority access' },
                { icon: '🎨', text: 'DragonixCard / Avatar NFT holders → Whitelist' },
                { icon: '⚡', text: 'Skill buyers → Whitelist access' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                  <span className="text-base">{item.icon}</span>
                  <span className={`jersey-20-regular text-white/70 ${isMobile ? 'text-base' : 'text-lg'}`}>{item.text}</span>
                </div>
              ))}
            </div>

            <div className={`rounded-lg bg-white/5 border border-white/10 mb-3 ${isMobile ? 'p-2' : 'p-3'}`}>
              <p className={`jersey-20-regular text-white/40 text-center ${isMobile ? 'text-sm' : 'text-base'}`}>
                Platform: <span className="text-amber-400">tools.smithii.io</span> · Telegram & X
              </p>
            </div>

            {/* Treasury info */}
            <div className={`rounded-lg bg-purple-500/10 border border-purple-500/20 ${isMobile ? 'p-3' : 'p-4'}`}>
              <p className={`jersey-15-regular text-purple-300 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>🏛️ Token Stability</p>
              <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                {[
                  { icon: '🔒', color: 'text-emerald-400', text: 'Treasury holds unsold tokens' },
                  { icon: '🎁', color: 'text-blue-400', text: 'Unsold → community rewards' },
                  { icon: '📈', color: 'text-amber-400', text: 'Strategic liquidity support' },
                ].map(p => (
                  <div key={p.text} className="flex items-start gap-2 bg-white/5 rounded-lg p-2">
                    <span className={`${p.color} text-base mt-0.5`}>{p.icon}</span>
                    <p className={`jersey-20-regular text-white/60 ${isMobile ? 'text-base' : 'text-base'}`}>{p.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Presale details - Compact horizontal layout */}
          <motion.div
            className={`card-unified ${isMobile ? 'p-4' : 'p-5'}`}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className={`jersey-15-regular text-white mb-3 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Presale Details</h3>
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-5'}`}>
              {presaleDetails.map((d) => (
                <div key={d.label} className={`bg-white/5 rounded-lg p-2 text-center border border-white/5 ${d.highlight ? 'border-amber-500/30' : ''}`}>
                  <span className={`jersey-20-regular block text-white/50 ${isMobile ? 'text-xl' : 'text-xl'} mb-1`}>{d.label}</span>
                  <span className={`jersey-15-regular block ${d.highlight ? 'text-amber-400' : 'text-white'} ${isMobile ? 'text-xl' : 'text-xl'}`}>
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Social links */}
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <a
              href="https://x.com/nuxchain"
              target="_blank"
              rel="noopener noreferrer"
              className={`btn-secondary flex items-center justify-center gap-2 rounded-xl jersey-20-regular ${isMobile ? 'py-3 text-base' : 'py-4 text-lg'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Twitter / X
            </a>
            <a
              href="https://t.me/+ESghwuU2rCpiNmI5"
              target="_blank"
              rel="noopener noreferrer"
              className={`btn-secondary flex items-center justify-center gap-2 rounded-xl jersey-20-regular ${isMobile ? 'py-3 text-base' : 'py-4 text-lg'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
