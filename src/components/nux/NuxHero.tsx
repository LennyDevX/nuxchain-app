import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

export default function NuxHero() {
  const isMobile = useIsMobile();

  return (
    <section className={`text-center ${isMobile ? 'mb-8 px-4' : 'mb-16'}`}>

      {/* 3-Tier Launch Badge */}
      <motion.div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.span
          className="w-2 h-2 rounded-full bg-amber-400"
          animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className={`jersey-20-regular text-amber-400 tracking-widest uppercase ${isMobile ? 'text-base' : 'text-lg'}`}>
          3-Tier Launch: Whitelist → Presale → LP
        </span>
      </motion.div>

      {/* Title */}
      <motion.h1
        className={`jersey-15-regular font-bold text-gradient ${isMobile ? 'text-5xl mb-5' : 'text-8xl mb-6'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        NUX Token
      </motion.h1>

      {/* Supply pill */}
      

      {/* 3-Tier Prices — compact row */}
      <motion.div
        className={`flex items-center justify-center flex-wrap mb-6 ${isMobile ? 'gap-2' : 'gap-3'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        {[
          { label: 'Whitelist', price: '0.000015 SOL', color: 'text-amber-300', dot: 'bg-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Presale', price: '0.000025 SOL', color: 'text-blue-300', dot: 'bg-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'LP/TGE', price: '0.00004 SOL', color: 'text-emerald-300', dot: 'bg-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(t => (
          <div key={t.label} className={`flex items-center gap-1.5 border rounded-lg ${t.bg} ${isMobile ? 'px-3 py-1.5' : 'px-4 py-2'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
            <span className={`jersey-20-regular ${t.color} ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
              {t.label}: <span className="text-white font-semibold">{t.price}</span>
            </span>
          </div>
        ))}
      </motion.div>

      {/* Subtitle */}
      <motion.p
        className={`jersey-20-regular text-white/60 mx-auto leading-relaxed ${isMobile ? 'text-lg max-w-sm' : 'text-2xl max-w-2xl'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Native token of NuxChain — Solana, 100M fixed supply.
        Earn 40K NUX from Polygon activity. Whitelist min: 5,000 NUX.
      </motion.p>

      {/* Chain badges */}
      <motion.div
        className={`flex items-center justify-center flex-wrap ${isMobile ? 'gap-2 mt-5' : 'gap-3 mt-8'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        {[
          { label: 'Polygon Ecosystem', dot: 'bg-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-300' },
          { label: 'Solana Token', dot: 'bg-green-400', bg: 'bg-green-500/10 border-green-500/20', text: 'text-green-300' },
          { label: 'Cross-Chain Rewards', dot: 'bg-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-300' },
        ].map(b => (
          <div key={b.label} className={`flex items-center gap-2 border rounded-lg ${b.bg} ${isMobile ? 'px-3 py-1.5' : 'px-4 py-2'}`}>
            <div className={`w-2 h-2 rounded-full ${b.dot}`} />
            <span className={`jersey-20-regular ${b.text} ${isMobile ? 'text-base' : 'text-lg'}`}>{b.label}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
