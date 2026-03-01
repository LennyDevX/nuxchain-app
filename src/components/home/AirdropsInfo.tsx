import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { Link } from 'react-router-dom';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

const airdropPerks = [
  { icon: '🎁', title: 'Free NFT Drops', desc: 'Active users receive exclusive NFTs at no cost.' },
  { icon: '💎', title: 'Real Utility', desc: 'Airdropped NFTs carry staking boosts and access passes.' },
  { icon: '📅', title: 'Regular Events', desc: 'Frequent airdrop campaigns for community members.' },
  { icon: '🔗', title: 'Cross-chain Ready', desc: 'Claim on Polygon, use rewards on Solana.' },
];

const AirdropsInfo = () => {
  const isMobile = useIsMobile();

  return (
    <section className={`relative z-10 border-t border-white/5 ${isMobile ? 'py-10' : 'py-24'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-10' : 'lg:grid-cols-2 gap-16'} items-center`}>

          {/* Left — Content */}
          <div>
            <motion.div {...fadeUp()}>
              <span className="jersey-20-regular text-amber-400 text-lg uppercase tracking-widest">Airdrops</span>
              <h2 className={`jersey-15-regular text-white mt-2 mb-4 ${isMobile ? 'text-4xl' : 'text-5xl lg:text-6xl'}`}>
                Exclusive <span className="text-gradient">NFT Airdrops</span>
              </h2>
              <p className={`jersey-20-regular text-white/60 mb-8 leading-relaxed ${isMobile ? 'text-lg' : 'text-xl'}`}>
                Nuxchain rewards active community members with exclusive NFT airdrops.
                Each drop unlocks real utility — staking bonuses, marketplace access, and special privileges inside the ecosystem.
              </p>
            </motion.div>

            <div className={`space-y-4 mb-8 ${isMobile ? 'grid grid-cols-2 gap-3 space-y-0' : ''}`}>
              {airdropPerks.map((perk, i) => (
                <motion.div key={i} {...fadeUp(0.1 + i * 0.08)} className="card-unified p-4 flex gap-3 items-start">
                  <span className="text-2xl flex-shrink-0">{perk.icon}</span>
                  <div>
                    <h3 className={`jersey-15-regular text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>{perk.title}</h3>
                    <p className={`jersey-20-regular text-white/55 ${isMobile ? 'text-base' : 'text-lg'}`}>{perk.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div {...fadeUp(0.4)} className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4`}>
              <Link to="/airdrop" className="btn-primary jersey-20-regular text-xl px-8 py-4 rounded-xl inline-flex items-center gap-2 justify-center">
                🎁 Claim Airdrop
              </Link>
              <Link to="/nfts" className="jersey-20-regular text-xl px-8 py-4 rounded-xl inline-flex items-center gap-2 justify-center border border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/10 transition-all text-amber-300">
                Explore NFTs →
              </Link>
            </motion.div>
          </div>

          {/* Right — Visual */}
          {!isMobile && (
            <motion.div {...fadeUp(0.15)} className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/10 rounded-3xl blur-3xl scale-110" />
                <div className="relative rounded-2xl overflow-hidden border border-amber-500/20 shadow-2xl">
                  <img
                    src="/assets/unused/Airdrops.webp"
                    alt="NFT Airdrops"
                    className="w-full max-w-md object-cover rounded-2xl"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 bg-black/80 backdrop-blur-sm border border-amber-500/40 rounded-2xl p-4 shadow-xl">
                  <p className="jersey-20-regular text-amber-300 text-lg">🎁 Next Drop</p>
                  <p className="jersey-15-regular text-white text-xl">Coming Soon</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AirdropsInfo;