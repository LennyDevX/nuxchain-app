import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

export function CTASection() {
  const isMobile = useIsMobile();

  return (
    <section className="py-20 px-4 border-t border-white/5">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div {...fadeUp()}>
          <h2 className={`jersey-15-regular text-gradient mb-5 ${isMobile ? 'text-4xl' : 'text-5xl lg:text-6xl'}`}>
            Ready to Build Your Future?
          </h2>
          <p className={`jersey-20-regular text-white/60 mb-10 leading-relaxed ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            Join the Nuxchain ecosystem — create NFTs, earn rewards, and be part of the cross-chain revolution.
          </p>
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-center'} gap-4`}>
            <a 
              href="/rewards" 
              className={`btn-primary jersey-20-regular inline-flex items-center gap-2 justify-center rounded-xl ${isMobile ? 'text-xl px-10 py-4' : 'text-2xl px-14 py-5'}`}
            >
              🏆 NUX Rewards Hub
            </a>
            <a 
              href="/airdrop" 
              className={`jersey-20-regular inline-flex items-center gap-2 justify-center border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 transition-all rounded-xl ${isMobile ? 'text-xl px-10 py-4' : 'text-2xl px-14 py-5'}`}
            >
              🎁 Claim Airdrop
            </a>
            <a 
              href="/create-my-nfts" 
              className={`jersey-20-regular inline-flex items-center gap-2 justify-center border border-amber-500/50 hover:border-amber-400 hover:bg-amber-500/10 transition-all rounded-xl text-amber-300 ${isMobile ? 'text-xl px-10 py-4' : 'text-2xl px-14 py-5'}`}
            >
              🎨 Create NFT
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
