import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/mobile/useIsMobile';
import Footer from '../components/layout/footer';
import {
  AboutSection,
  NFTEconomySection,
  RewardsSection,
  ComparisonSection,
  ArchitectureSection,
  CTASection,
} from '../components/about';

const AVATARS = [
  '/AvatarsNFTs/Avatar1-remove-bg.png',
  '/AvatarsNFTs/Avatar2.png',
  '/AvatarsNFTs/Avatar3.png',
  '/AvatarsNFTs/Avatar4.png',
  '/AvatarsNFTs/Avatar5.png',
  '/AvatarsNFTs/Avatar6.png',
  '/AvatarsNFTs/Avatar7.png',
  '/AvatarsNFTs/Avatar8.png',
  '/AvatarsNFTs/Avatar9.png',
  '/AvatarsNFTs/Avatar10.png',
];

function About() {
  const isMobile = useIsMobile();

  return (
    <>
      <div className={`min-h-screen text-white ${isMobile ? 'pb-32' : 'pb-20'}`}>
        
        {/* Hero with animated background */}
        <section className="relative overflow-hidden pt-16 pb-12 px-4 text-center">
          {/* Animated Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-purple-500/10 to-transparent" />
            
            {/* Floating orbs */}
            <motion.div
              className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]"
              animate={{ 
                x: [0, 60, 0], 
                y: [0, 40, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute top-32 right-1/4 w-[400px] h-[400px] bg-pink-500/15 rounded-full blur-[80px]"
              animate={{ 
                x: [0, -50, 0], 
                y: [0, 60, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            />
            <motion.div
              className="absolute bottom-20 left-1/3 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[60px]"
              animate={{ 
                x: [0, 40, 0], 
                y: [0, -30, 0],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            />
          </div>

          {/* Infinite Scroll Avatar Strip - Top */}
          <div className="absolute top-0 left-0 right-0 overflow-hidden pointer-events-none z-0">
            <motion.div
              className="flex gap-6 py-3"
              animate={{ x: [0, -2000] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
              {[...AVATARS, ...AVATARS, ...AVATARS, ...AVATARS].map((src, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden border border-purple-500/20 bg-black/20"
                  style={{ 
                    boxShadow: '0 0 30px rgba(168,85,247,0.2), inset 0 0 20px rgba(168,85,247,0.1)',
                  }}
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Infinite Scroll Avatar Strip - Second Row (Reverse) */}
          <div className="absolute top-24 left-0 right-0 overflow-hidden pointer-events-none z-0">
            <motion.div
              className="flex gap-6 py-3"
              animate={{ x: [-2000, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            >
              {[...AVATARS.reverse(), ...AVATARS, ...AVATARS, ...AVATARS].map((src, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-xl overflow-hidden border border-pink-500/20 bg-black/20"
                  style={{ 
                    boxShadow: '0 0 25px rgba(236,72,153,0.15), inset 0 0 15px rgba(236,72,153,0.08)',
                  }}
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover opacity-50 hover:opacity-90 transition-opacity"
                  />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative max-w-5xl mx-auto pt-32 md:pt-40"
          >
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/20 border border-purple-500/50 jersey-20-regular text-purple-300 text-lg mb-6 backdrop-blur-sm"
            >
              🌐 Cross-Chain · NFT-Powered · AI-Driven
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={`jersey-15-regular text-gradient leading-tight mb-6 ${isMobile ? 'text-5xl' : 'text-7xl lg:text-8xl'}`}
            >
              About Nuxchain
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className={`jersey-20-regular text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed ${isMobile ? 'text-xl' : 'text-2xl'}`}
            >
              A next-generation cross-chain platform where NFTs power a real economy —
              enabling creators, traders and builders to earn, collaborate and grow.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-center'} gap-4`}
            >
              <a href="/rewards" className="btn-primary jersey-20-regular text-xl px-8 py-4 rounded-xl inline-flex items-center gap-2 justify-center shadow-lg shadow-purple-500/20">
                🏆 NUX Rewards Hub
              </a>
              <a href="/airdrop" className="jersey-20-regular text-xl px-8 py-4 rounded-xl inline-flex items-center gap-2 justify-center border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 transition-all backdrop-blur-sm">
                🎁 Join Airdrop
              </a>
            </motion.div>
          </motion.div>

          {/* Floating side avatars */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.img
              src="/AvatarsNFTs/Avatar11.png"
              alt=""
              className="absolute opacity-20 w-28 md:w-40 rounded-xl border border-purple-500/30"
              style={{ top: '35%', left: '3%', boxShadow: '0 0 40px rgba(168,85,247,0.3)' }}
              animate={{ y: [0, -25, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.img
              src="/AvatarsNFTs/Avatar12.png"
              alt=""
              className="absolute opacity-20 w-28 md:w-40 rounded-xl border border-pink-500/30"
              style={{ top: '35%', right: '3%', boxShadow: '0 0 40px rgba(236,72,153,0.3)' }}
              animate={{ y: [0, 25, 0], rotate: [0, -8, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
          </div>
        </section>

        {/* Page Sections */}
        <AboutSection />
        <NFTEconomySection />
        <RewardsSection />
        <ComparisonSection />
        <ArchitectureSection />
        <CTASection />

        <Footer />
      </div>
    </>
  );
}

export default About;
