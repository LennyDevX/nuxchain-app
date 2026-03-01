import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

const features = [
  { icon: '🔗', title: 'Cross-Chain Identity', desc: 'Your Polygon wallet is your on-chain identity. Your Solana wallet is your reward destination. Two chains, one ecosystem — no bridges needed.' },
  { icon: '🤖', title: 'AI-Powered', desc: 'Nuxchain integrates AI to assist creators, analyze activity, and power the NUX Rewards Engine — evaluating your contributions every 30 days.' },
  { icon: '🎨', title: 'NFT Economy', desc: 'NFTs on Nuxchain are more than art. They carry real utility — access, rewards, governance, and capabilities defined by their creators.' },
];

export function AboutSection() {
  const isMobile = useIsMobile();

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeUp()} className="text-center mb-12">
          <span className="jersey-20-regular text-purple-400 text-lg uppercase tracking-widest">The Platform</span>
          <h2 className={`jersey-15-regular text-gradient mt-2 ${isMobile ? 'text-4xl' : 'text-5xl'}`}>What is Nuxchain?</h2>
        </motion.div>
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {features.map((item, i) => (
            <motion.div key={i} {...fadeUp(i * 0.12)} className="card-unified p-6 text-center">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className={`jersey-15-regular text-white mb-3 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{item.title}</h3>
              <p className={`jersey-20-regular text-white/60 leading-relaxed ${isMobile ? 'text-lg' : 'text-xl'}`}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
