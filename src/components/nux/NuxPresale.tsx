import { motion } from 'framer-motion';

const phases = [
  {
    step: '01',
    title: 'Token Creation',
    desc: 'NUX SPL token deployed on Solana. Mint authority revoked — 21M fixed forever.',
    icon: '🪙',
    color: 'text-amber-400',
    border: 'border-amber-400/30',
    status: 'upcoming',
  },
  {
    step: '02',
    title: 'Whitelist Phase',
    desc: 'Priority access for current POL stakers, NFT holders, and skill buyers. Register your Solana wallet now.',
    icon: '📋',
    color: 'text-blue-400',
    border: 'border-blue-400/30',
    status: 'upcoming',
  },
  {
    step: '03',
    title: 'Public Presale',
    desc: 'Open presale on Smithii Launchpad (tools.smithii.io). Buy NUX at presale price before listing.',
    icon: '🚀',
    color: 'text-purple-400',
    border: 'border-purple-400/30',
    status: 'upcoming',
  },
  {
    step: '04',
    title: 'TGE & Listing',
    desc: 'Liquidity Pool created on Raydium. LP tokens burned. NUX listed on Jupiter aggregator.',
    icon: '📈',
    color: 'text-emerald-400',
    border: 'border-emerald-400/30',
    status: 'upcoming',
  },
  {
    step: '05',
    title: 'Rewards Distribution',
    desc: 'NUX distributed to registered Polygon users via Smithii Multisender. Claim site activated.',
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
  { label: 'Total Supply', value: '21,000,000 NUX', highlight: true },
  { label: 'Community & Ecosystem', value: '11,550,000 NUX (55%)', highlight: false },
  { label: 'Blockchain', value: 'Solana (SPL Token)', highlight: false },
  { label: 'Launchpad', value: 'Smithii Token Launchpad', highlight: false },
  { label: 'Whitelist Discount', value: '20–30% vs public price', highlight: true },
  { label: 'Liquidity Lock', value: 'LP tokens burned at TGE', highlight: false },
];

export default function NuxPresale() {
  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="jersey-15-regular text-4xl lg:text-5xl text-gradient mb-3">Presale & Launch Roadmap</h2>
        <p className="jersey-20-regular text-white/50 text-lg lg:text-xl">From token creation to full ecosystem integration</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Timeline */}
        <div className="space-y-4">
          {phases.map((phase, i) => (
            <motion.div
              key={phase.step}
              className={`flex gap-4 p-4 rounded-2xl bg-white/5 border ${phase.border} relative overflow-hidden`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              {/* Step number */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border ${phase.border} flex items-center justify-center`}>
                <span className={`jersey-15-regular text-base ${phase.color}`}>{phase.step}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{phase.icon}</span>
                  <h3 className={`jersey-15-regular text-xl ${phase.color}`}>{phase.title}</h3>
                </div>
                <p className="jersey-20-regular text-white/50 text-base leading-relaxed">{phase.desc}</p>
              </div>

              {/* Connector line */}
              {i < phases.length - 1 && (
                <div className="absolute left-8 bottom-0 w-0.5 h-4 bg-white/10 translate-y-full" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Presale details + CTA */}
        <div className="space-y-5">
          {/* Details card */}
          <motion.div
            className="card-unified p-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="jersey-15-regular text-2xl text-white mb-4">Presale Details</h3>
            <div className="space-y-3">
              {presaleDetails.map((d) => (
                <div key={d.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="jersey-20-regular text-white/50 text-base">{d.label}</span>
                  <span className={`jersey-20-regular text-base font-medium ${d.highlight ? 'text-amber-400' : 'text-white/80'}`}>
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Whitelist CTA */}
          <motion.div
            className="card-unified p-6 border border-amber-500/20 bg-amber-500/5"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">⭐</span>
              <div>
                <h3 className="jersey-15-regular text-2xl text-amber-400">Get Whitelist Access</h3>
                <p className="jersey-20-regular text-white/50 text-base mt-1">
                  Current NuxChain users get automatic whitelist priority. Register your Solana wallet above to secure your spot.
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {[
                'POL stakers → Automatic whitelist',
                'DragonixCard / Avatar NFT holders → Automatic whitelist',
                'Skill buyers → Automatic whitelist',
                'Airdrop registered → Priority access',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="text-emerald-400 text-sm">✓</span>
                  <span className="jersey-20-regular text-white/60 text-base">{item}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="jersey-20-regular text-white/40 text-sm text-center">
                Presale platform: <span className="text-amber-400">tools.smithii.io</span> · Announcement via Telegram & X
              </p>
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
              className="btn-secondary flex items-center justify-center gap-2 py-4 rounded-xl jersey-20-regular text-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Twitter / X
            </a>
            <a
              href="https://t.me/+ESghwuU2rCpiNmI5"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center justify-center gap-2 py-4 rounded-xl jersey-20-regular text-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
