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
  { icon: '🖼️', title: 'Upload', desc: 'Upload any image — artwork, photography, digital creation.' },
  { icon: '⚙️', title: 'Set Properties', desc: 'Define name, description, royalties, and utility.' },
  { icon: '🔗', title: 'Mint', desc: 'Your NFT is minted on-chain with a unique token ID.' },
  { icon: '💰', title: 'Sell & Earn', desc: 'List on the marketplace and earn royalties forever.' },
];

const TokenizationSection = () => {
  const isMobile = useIsMobile();

  return (
    <section className={`relative z-10 border-t border-white/5 ${isMobile ? 'py-14' : 'py-24'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-10' : 'lg:grid-cols-2 gap-16'} items-center`}>

          {/* Left — Content */}
          <div>
            <motion.div {...fadeUp()}>
              <span className="jersey-20-regular text-pink-400 text-lg uppercase tracking-widest">Create</span>
              <h2 className={`jersey-15-regular text-white mt-2 mb-4 ${isMobile ? 'text-4xl' : 'text-5xl lg:text-6xl'}`}>
                <span className="text-gradient">Tokenization</span>
              </h2>
              <p className={`jersey-20-regular text-white/60 mb-8 leading-relaxed ${isMobile ? 'text-lg' : 'text-xl'}`}>
                Transform your digital art into unique NFTs with real value. Simple, secure, and fully on-chain.
                Set royalties, define utilities, and sell on the Nuxchain marketplace.
              </p>
            </motion.div>

            {/* Mobile: 2x2 Compact Grid */}
            {isMobile ? (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    {...fadeUp(0.1 + i * 0.08)}
                    className="card-unified p-3 flex flex-col items-center text-center"
                  >
                    <span className="text-3xl mb-2">{step.icon}</span>
                    <h3 className="jersey-15-regular text-white text-base mb-1">{step.title}</h3>
                    <p className="jersey-20-regular text-white/55 text-sm leading-tight">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Desktop: Vertical List */
              <div className="space-y-4 mb-8">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    {...fadeUp(0.1 + i * 0.08)}
                    className="card-unified p-5 flex gap-4 items-center"
                  >
                    <span className="text-3xl flex-shrink-0">{step.icon}</span>
                    <div>
                      <h3 className="jersey-15-regular text-white text-xl">{step.title}</h3>
                      <p className="jersey-20-regular text-white/55 text-lg">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <motion.div {...fadeUp(0.45)} className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4`}>
              <Link to="/create-my-nfts" className="btn-primary jersey-20-regular text-xl px-8 py-4 rounded-xl inline-flex items-center gap-2 justify-center">
                🎨 Create NFT Now
              </Link>
              <Link to="/nfts" className="jersey-20-regular text-xl px-8 py-4 rounded-xl inline-flex items-center gap-2 justify-center border border-pink-500/40 hover:border-pink-400 hover:bg-pink-500/10 transition-all text-pink-300">
                Browse Marketplace →
              </Link>
            </motion.div>
          </div>

          {/* Right — Visual */}
          {!isMobile && (
            <motion.div {...fadeUp(0.15)} className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-pink-500/10 rounded-3xl blur-3xl scale-110" />
                <div className="relative rounded-2xl overflow-hidden border border-pink-500/20 shadow-2xl">
                  <img
                    src="/assets/unused/tokenization.webp"
                    alt="NFT Tokenization"
                    className="w-full max-w-md object-cover rounded-2xl"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div className="absolute -top-4 -right-4 bg-black/80 backdrop-blur-sm border border-pink-500/40 rounded-2xl p-4 shadow-xl">
                  <p className="jersey-20-regular text-pink-300 text-lg">🎨 Mint NFT</p>
                  <p className="jersey-15-regular text-white text-xl">On Polygon</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TokenizationSection;