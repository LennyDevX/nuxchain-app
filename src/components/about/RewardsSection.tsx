import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

const steps = [
  { icon: '🔗', label: 'Link Wallets', desc: 'Connect Polygon + Solana once. No transactions needed.' },
  { icon: '📊', label: 'Earn Activity Score', desc: 'Staking, NFTs, marketplace — every action counts.' },
  { icon: '⏱️', label: 'Monthly Evaluation', desc: 'Algorithm re-evaluates your score every 30 days.' },
  { icon: '💸', label: 'Receive NUX', desc: 'Rewards sent directly to your Solana wallet.' },
];

export function RewardsSection() {
  const isMobile = useIsMobile();

  return (
    <section className="py-16 px-4 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-12">
          <span className="jersey-20-regular text-amber-400 text-lg uppercase tracking-widest">Monthly Rewards</span>
          <h2 className={`jersey-15-regular text-gradient mt-2 ${isMobile ? 'text-4xl' : 'text-5xl'}`}>NUX Rewards Hub</h2>
          <p className={`jersey-20-regular text-white/60 max-w-2xl mx-auto mt-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            Your Polygon activity earns you NUX tokens — distributed monthly to your Solana wallet.
            No gas. No bridges. Pure cross-chain rewards.
          </p>
        </motion.div>
        
        <div className={`grid gap-6 mb-10 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
          {steps.map((step, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)} className="card-unified p-6 text-center relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center jersey-15-regular text-amber-400 text-lg">{i + 1}</div>
              <div className="text-4xl mb-3">{step.icon}</div>
              <h3 className={`jersey-15-regular text-white mb-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{step.label}</h3>
              <p className={`jersey-20-regular text-white/55 ${isMobile ? 'text-base' : 'text-lg'}`}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
        
        <motion.div {...fadeUp(0.3)} className="text-center">
          <a href="/rewards" className="btn-primary jersey-20-regular text-xl px-10 py-4 rounded-xl inline-flex items-center gap-3">
            🏆 Open NUX Rewards Hub
          </a>
        </motion.div>
      </div>
    </section>
  );
}
