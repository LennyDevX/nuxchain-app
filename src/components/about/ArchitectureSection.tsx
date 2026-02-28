import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

const chains = [
  {
    icon: '/assets/tokens/PolLogo.webp',
    name: 'Polygon',
    subtitle: 'Activity Chain',
    color: 'purple',
    desc: 'All on-chain activity happens here — staking, NFT minting, marketplace trades, skill purchases. Your Polygon wallet is your identity. Ultra-fast, ultra-cheap.',
    tags: ['Staking', 'NFT Minting', 'Marketplace', 'Skills', 'Governance'],
  },
  {
    icon: '/assets/tokens/SolanaLogo.png',
    name: 'Solana',
    subtitle: 'Rewards Chain',
    color: 'green',
    desc: 'NUX token rewards are distributed here. Zero gas for recipients. Link your Solana wallet once — receive monthly rewards automatically.',
    tags: ['NUX Rewards', 'Zero Gas', 'Monthly Drops', 'SPL Tokens'],
  },
];

export function ArchitectureSection() {
  const isMobile = useIsMobile();

  return (
    <section className="py-16 px-4 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-12">
          <span className="jersey-20-regular text-green-400 text-lg uppercase tracking-widest">Architecture</span>
          <h2 className={`jersey-15-regular text-gradient mt-2 ${isMobile ? 'text-4xl' : 'text-5xl'}`}>Cross-Chain by Design</h2>
        </motion.div>
        
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {chains.map((chain, i) => (
            <motion.div key={i} {...fadeUp(i * 0.05)} className="card-unified p-8">
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-14 h-14 rounded-xl bg-${chain.color}-500/20 border border-${chain.color}-500/40 flex items-center justify-center overflow-hidden`}><img src={chain.icon} alt={chain.name} className="w-full h-full object-contain" /></div>
                <div>
                  <h3 className={`jersey-15-regular text-white ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{chain.name}</h3>
                  <p className={`jersey-20-regular text-${chain.color}-300 text-lg`}>{chain.subtitle}</p>
                </div>
              </div>
              <p className={`jersey-20-regular text-white/60 leading-relaxed ${isMobile ? 'text-lg' : 'text-xl'}`}>{chain.desc}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {chain.tags.map(tag => (
                  <span key={tag} className={`jersey-20-regular text-base px-3 py-1 rounded-full bg-${chain.color}-500/15 border border-${chain.color}-500/30 text-${chain.color}-300`}>{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
