import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

export default function NuxHero() {
  const isMobile = useIsMobile();

  return (
    <section className="text-center mb-12">
      {/* Badge */}
      <motion.div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.span
          className="w-2 h-2 rounded-full bg-amber-400"
          animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="jersey-20-regular text-amber-400 text-base tracking-widest uppercase">
          Presale Coming Soon
        </span>
      </motion.div>

      {/* Title */}
      <motion.h1
        className={`jersey-15-regular font-bold text-gradient mb-4 ${isMobile ? 'text-6xl' : 'text-8xl'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        NUX Token
      </motion.h1>

      {/* Supply pill */}
      <motion.div
        className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <span className="text-2xl">₿</span>
        <div className="text-left">
          <p className="jersey-15-regular text-white text-2xl">21,000,000 NUX</p>
          <p className="jersey-20-regular text-white/50 text-base">Fixed Supply · Non-Mintable · Non-Burnable</p>
        </div>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        className={`jersey-20-regular text-white/60 max-w-2xl mx-auto leading-relaxed ${isMobile ? 'text-lg' : 'text-xl'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        The native token of the NuxChain ecosystem — built on Solana with a fixed supply of 21M,
        like Bitcoin. Earn NUX rewards based on your Polygon activity: staking, NFTs, skills, and more.
      </motion.p>

      {/* Chain badges */}
      <motion.div
        className="flex items-center justify-center gap-4 mt-6 flex-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="jersey-20-regular text-purple-300 text-base">Ecosystem on Polygon</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="jersey-20-regular text-green-300 text-base">Token on Solana</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="jersey-20-regular text-blue-300 text-base">Cross-Chain Rewards</span>
        </div>
      </motion.div>
    </section>
  );
}
