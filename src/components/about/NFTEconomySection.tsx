import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

const PASSPORT_IMG = '/assets/unused/DragonixPassportCard.jpg';

const utilityList = [
  '🎫 Access passes to exclusive features',
  '📈 Staking reward multipliers',
  '🗳️ Governance & voting rights',
  '⚡ Custom on-chain action triggers',
  '🌐 Cross-platform utility (in & out of Nuxchain)',
];

export function NFTEconomySection() {
  const isMobile = useIsMobile();

  return (
    <section className="py-16 px-4 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className={`grid gap-10 items-center ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <motion.div {...fadeUp()} className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-[0_0_60px_rgba(168,85,247,0.15)]">
              <img 
                src={PASSPORT_IMG} 
                alt="Dragonix Passport NFT" 
                className="w-full object-cover rounded-2xl"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-2xl" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="jersey-20-regular text-purple-300 text-lg">🐉 Dragonix Passport NFT</span>
                <p className="jersey-20-regular text-white/60 text-base mt-1">Premium NFT with real utility inside & outside Nuxchain</p>
              </div>
            </div>
            <div className="absolute -inset-4 bg-purple-500/10 rounded-3xl blur-2xl -z-10" />
          </motion.div>
          
          <motion.div {...fadeUp(0.15)}>
            <span className="jersey-20-regular text-amber-400 text-lg uppercase tracking-widest">NFT Economy</span>
            <h2 className={`jersey-15-regular text-gradient mt-2 mb-5 ${isMobile ? 'text-4xl' : 'text-5xl'}`}>NFTs with Real Power</h2>
            <p className={`jersey-20-regular text-white/70 mb-5 leading-relaxed ${isMobile ? 'text-lg' : 'text-xl'}`}>
              On Nuxchain, NFTs are programmable assets. Creators define what their NFT does —
              access passes, reward multipliers, governance votes, or custom on-chain actions.
            </p>
            <p className={`jersey-20-regular text-white/70 mb-7 leading-relaxed ${isMobile ? 'text-lg' : 'text-xl'}`}>
              Nuxchain will launch <span className="text-amber-400">Premium NFTs</span> with
              capabilities that empower users both inside and outside the ecosystem —
              creating a self-sustaining economy driven by real utility.
            </p>
            <div className="space-y-3">
              {utilityList.map((item, i) => (
                <p key={i} className={`jersey-20-regular text-white/80 ${isMobile ? 'text-lg' : 'text-xl'}`}>{item}</p>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
