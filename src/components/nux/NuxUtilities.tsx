import { motion } from 'framer-motion';

const utilities = [
  {
    icon: '⚡',
    title: 'Staking Rewards',
    color: 'text-emerald-400',
    border: 'border-emerald-400/20',
    bg: 'bg-emerald-400/5',
    desc: 'Earn NUX automatically based on your POL staking activity. The more you stake and the longer you lock, the more NUX you accumulate.',
    tags: ['Flexible', '30d', '90d', '180d', '365d'],
    status: 'active',
  },
  {
    icon: '🎴',
    title: 'NFT Marketplace',
    color: 'text-purple-400',
    border: 'border-purple-400/20',
    bg: 'bg-purple-400/5',
    desc: 'Buy and sell DragonixCards, Avatar NFTs, and Builder NFTs using NUX as the primary currency within the NuxChain marketplace.',
    tags: ['DragonixCards', 'Avatars', 'Builder NFTs'],
    status: 'soon',
  },
  {
    icon: '⚙️',
    title: 'Skills System',
    color: 'text-blue-400',
    border: 'border-blue-400/20',
    bg: 'bg-blue-400/5',
    desc: 'Purchase and renew staking skills (16 types, 5 rarities) using NUX. Skills boost your APY up to 118% and unlock platform features.',
    tags: ['16 Skill Types', '5 Rarities', 'APY Boost'],
    status: 'soon',
  },
  {
    icon: '🤖',
    title: 'Nuxbee AI Premium',
    color: 'text-pink-400',
    border: 'border-pink-400/20',
    bg: 'bg-pink-400/5',
    desc: 'Unlock advanced AI features powered by Gemini 2.5. Portfolio analysis, staking optimization, and on-chain insights — all powered by NUX.',
    tags: ['Gemini 2.5', 'Portfolio AI', 'Web Analysis'],
    status: 'soon',
  },
  {
    icon: '🎫',
    title: 'Builder Program',
    color: 'text-amber-400',
    border: 'border-amber-400/20',
    bg: 'bg-amber-400/5',
    desc: 'Hold Builder NFTs to earn NUX revenue share. Moderators, ambassadors, validators, and creators all earn NUX for their contributions.',
    tags: ['Revenue Share', 'Governance', 'Royalties'],
    status: 'soon',
  },
  {
    icon: '🗳️',
    title: 'Governance',
    color: 'text-cyan-400',
    border: 'border-cyan-400/20',
    bg: 'bg-cyan-400/5',
    desc: 'Vote on protocol decisions, fee structures, and ecosystem upgrades. NUX holders shape the future of NuxChain.',
    tags: ['DAO Voting', 'Protocol Params', 'Treasury'],
    status: 'future',
  },
];

const statusBadge = (status: string) => {
  if (status === 'active') return <span className="jersey-20-regular text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Live</span>;
  if (status === 'soon') return <span className="jersey-20-regular text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Post-Launch</span>;
  return <span className="jersey-20-regular text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40 border border-white/10">Roadmap</span>;
};

export default function NuxUtilities() {
  return (
    <section className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="jersey-15-regular text-5xl md:text-8xl text-gradient mb-3">NUX Utilities</h2>
        <p className="jersey-20-regular text-white/50 text-xl md:text-3xl">Real utility across the entire NuxChain ecosystem</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {utilities.map((u, i) => (
          <motion.div
            key={u.title}
            className={`card-unified p-5 border ${u.border} ${u.bg} flex flex-col gap-3`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{u.icon}</span>
                <h3 className={`jersey-15-regular text-2xl ${u.color}`}>{u.title}</h3>
              </div>
              {statusBadge(u.status)}
            </div>

            <p className="jersey-20-regular text-white/60 text-xl leading-relaxed">{u.desc}</p>

            <div className="flex flex-wrap gap-2 mt-auto">
              {u.tags.map((tag) => (
                <span
                  key={tag}
                  className="jersey-20-regular text-xl px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
