import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const AVATARS = [
  '/AvatarsNFTs/Avatar2.png',
  '/AvatarsNFTs/Avatar3.png',
  '/AvatarsNFTs/Avatar4.png',
  '/AvatarsNFTs/Avatar5.png',
  '/AvatarsNFTs/Avatar6.png',
  '/AvatarsNFTs/Avatar7.png',
  '/AvatarsNFTs/Avatar8.png',
  '/AvatarsNFTs/Avatar9.png',
  '/AvatarsNFTs/Avatar10.png',
  '/AvatarsNFTs/Avatar11.png',
];

export function HeroSection() {
  const isMobile = useIsMobile();

  return (
    <section className="relative overflow-hidden pt-16 pb-12 px-4 text-center">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-20 right-1/4 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* Infinite Scroll Avatar Strip - Top */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden pointer-events-none opacity-30">
        <motion.div
          className="flex gap-8 py-4"
          animate={{ x: [0, -1920] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        >
          {[...AVATARS, ...AVATARS, ...AVATARS].map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-xl"
              style={{ filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.3))' }}
            />
          ))}
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative max-w-5xl mx-auto pt-24 md:pt-32"
      >
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/15 border border-purple-500/40 jersey-20-regular text-purple-300 text-lg mb-6">
          🌐 Cross-Chain · NFT-Powered · AI-Driven
        </span>

        <h1 className={`jersey-15-regular text-gradient leading-tight mb-6 ${isMobile ? 'text-5xl' : 'text-7xl lg:text-8xl'}`}>
          About Nuxchain
        </h1>

        <p className={`jersey-20-regular text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          A next-generation cross-chain platform where NFTs power a real economy —
          enabling creators, traders and builders to earn, collaborate and grow.
        </p>

        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-center'} gap-4`}>
          <a href="/rewards" className="btn-primary jersey-20-regular text-xl px-8 py-4 rounded-xl inline-flex items-center gap-2 justify-center">
            🏆 NUX Rewards Hub
          </a>
          <a href="/airdrop" className="jersey-20-regular text-xl px-8 py-4 rounded-xl inline-flex items-center gap-2 justify-center border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 transition-all">
            🎁 Join Airdrop
          </a>
        </div>
      </motion.div>

      {/* Infinite Scroll Avatar Strip - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none opacity-30">
        <motion.div
          className="flex gap-8 py-4"
          animate={{ x: [-1920, 0] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
        >
          {[...AVATARS, ...AVATARS, ...AVATARS].reverse().map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-xl"
              style={{ filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.3))' }}
            />
          ))}
        </motion.div>
      </div>

      {/* Floating side avatars */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.img
          src="/AvatarsNFTs/Avatar2.png"
          alt=""
          className="absolute opacity-10 w-32 md:w-48"
          style={{ top: '20%', left: '2%' }}
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.img
          src="/AvatarsNFTs/Avatar11.png"
          alt=""
          className="absolute opacity-10 w-32 md:w-48"
          style={{ top: '20%', right: '2%' }}
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>
    </section>
  );
}
