import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

const steps = [
  { num: '01', icon: '🔗', title: 'Link Wallets', desc: 'Connect your Polygon wallet (activity) and Solana wallet (rewards). One-time setup, no transaction needed.' },
  { num: '02', icon: '📊', title: 'Earn Activity Score', desc: 'Every on-chain action counts — staking, NFT minting, marketplace trades, skill purchases.' },
  { num: '03', icon: '⏱️', title: 'Monthly Evaluation', desc: 'Our algorithm evaluates your score every 30 days and calculates your NUX allocation.' },
  { num: '04', icon: '💸', title: 'Receive NUX', desc: 'Rewards sent directly to your Solana wallet as SPL tokens. Zero gas for recipients.' },
];

const activityTypes = [
  { label: 'Staking', color: 'purple', icon: '🔒' },
  { label: 'NFT Minting', color: 'pink', icon: '🎨' },
  { label: 'Marketplace', color: 'blue', icon: '🛒' },
  { label: 'Skills', color: 'cyan', icon: '⚡' },
  { label: 'Governance', color: 'green', icon: '🗳️' },
  { label: 'Referrals', color: 'amber', icon: '👥' },
];

function RewardsHubSection() {
  const isMobile = useIsMobile();

  return (
    <section className={`relative z-10 border-t border-white/5 ${isMobile ? 'py-14' : 'py-24'} overflow-hidden`}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div {...fadeUp()} className="text-center mb-14">
          <span className="jersey-20-regular text-amber-400 text-lg uppercase tracking-widest">Monthly Rewards</span>
          <h2 className={`jersey-15-regular text-white mt-2 mb-4 ${isMobile ? 'text-4xl' : 'text-5xl lg:text-6xl'}`}>
            NUX <span className="text-gradient">Rewards Hub</span>
          </h2>
          <p className={`jersey-20-regular text-white/60 max-w-2xl mx-auto ${isMobile ? 'text-lg' : 'text-xl'}`}>
            Your on-chain activity on Polygon earns you NUX tokens — distributed monthly to your Solana wallet.
            No gas. No bridges. Pure cross-chain rewards.
          </p>
        </motion.div>

        {/* Activity types */}
        <motion.div {...fadeUp(0.1)} className="flex flex-wrap justify-center gap-3 mb-12">
          {activityTypes.map((a) => (
            <span key={a.label} className={`jersey-20-regular text-base px-4 py-2 rounded-full bg-${a.color}-500/15 border border-${a.color}-500/30 text-${a.color}-300 flex items-center gap-2`}>
              {a.icon} {a.label}
            </span>
          ))}
        </motion.div>

        {/* Steps */}
        <div className={`grid gap-4 mb-12 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
          {steps.map((step, i) => (
            <motion.div key={i} {...fadeUp(0.1 + i * 0.1)} className="card-unified p-6 relative">
              <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center jersey-15-regular text-amber-400 text-base">
                {step.num}
              </div>
              <div className="text-4xl mb-4 mt-2">{step.icon}</div>
              <h3 className={`jersey-15-regular text-white mb-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{step.title}</h3>
              <p className={`jersey-20-regular text-white/55 ${isMobile ? 'text-base' : 'text-lg'}`}>{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div {...fadeUp(0.3)} className={`grid gap-3 mb-12 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          {[
            { label: 'Rewards Pool', value: '20M NUX' },
            { label: 'Distribution', value: 'Monthly' },
            { label: 'Gas for Users', value: 'Zero' },
            { label: 'Chains', value: 'Polygon + SOL' },
          ].map((stat, i) => (
            <div key={i} className="card-unified p-4 text-center">
              <div className={`jersey-15-regular text-gradient ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{stat.value}</div>
              <div className="jersey-20-regular text-white/50 text-base mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp(0.4)} className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-center'} gap-4`}>
          <Link to="/rewards" className="btn-primary jersey-20-regular text-2xl px-10 py-4 rounded-xl inline-flex items-center gap-2 justify-center">
            🏆 Open Rewards Hub
          </Link>
          <Link to="/airdrop" className="jersey-20-regular text-2xl px-10 py-4 rounded-xl inline-flex items-center gap-2 justify-center border border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/10 transition-all text-amber-300">
            🎁 Claim Airdrop →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default RewardsHubSection;
