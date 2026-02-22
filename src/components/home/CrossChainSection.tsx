import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

function CrossChainSection() {
  const isMobile = useIsMobile();

  return (
    <section className={`relative z-10 border-t border-white/5 ${isMobile ? 'py-14' : 'py-24'} overflow-hidden`}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-green-500/8 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div {...fadeUp()} className="text-center mb-14">
          <span className="jersey-20-regular text-green-400 text-lg uppercase tracking-widest">Architecture</span>
          <h2 className={`jersey-15-regular text-white mt-2 mb-4 ${isMobile ? 'text-4xl' : 'text-5xl lg:text-6xl'}`}>
            Cross-Chain <span className="text-gradient">by Design</span>
          </h2>
          <p className={`jersey-20-regular text-white/60 max-w-2xl mx-auto ${isMobile ? 'text-lg' : 'text-xl'}`}>
            Two chains. One ecosystem. Polygon for activity, Solana for rewards.
            No bridges, no complexity — just seamless cross-chain power.
          </p>
        </motion.div>

        {/* Chain cards */}
        <div className={`grid gap-6 mb-12 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>

          {/* Polygon */}
          <motion.div {...fadeUp(0.1)} className="card-unified p-8 border-purple-500/30 hover:border-purple-400/60 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-4xl">🔷</div>
              <div>
                <h3 className={`jersey-15-regular text-white ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Polygon</h3>
                <p className="jersey-20-regular text-purple-300 text-lg">Activity Chain</p>
              </div>
            </div>
            <p className={`jersey-20-regular text-white/60 mb-6 leading-relaxed ${isMobile ? 'text-lg' : 'text-xl'}`}>
              All on-chain activity happens here — staking, NFT minting, marketplace trades, skill purchases.
              Your Polygon wallet is your identity. Ultra-fast, ultra-cheap.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['Staking', 'NFT Minting', 'Marketplace', 'Skills', 'Governance'].map(tag => (
                <span key={tag} className="jersey-20-regular text-base px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">{tag}</span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Avg Fee', value: '< $0.01' },
                { label: 'Speed', value: '~2 sec' },
                { label: 'TPS', value: '7,000+' },
              ].map((s, i) => (
                <div key={i} className="bg-purple-500/10 rounded-xl p-3 text-center">
                  <div className="jersey-15-regular text-purple-300 text-lg">{s.value}</div>
                  <div className="jersey-20-regular text-white/40 text-base">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Solana */}
          <motion.div {...fadeUp(0.15)} className="card-unified p-8 border-green-500/30 hover:border-green-400/60 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-center text-4xl">◎</div>
              <div>
                <h3 className={`jersey-15-regular text-white ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Solana</h3>
                <p className="jersey-20-regular text-green-300 text-lg">Rewards Chain</p>
              </div>
            </div>
            <p className={`jersey-20-regular text-white/60 mb-6 leading-relaxed ${isMobile ? 'text-lg' : 'text-xl'}`}>
              NUX token rewards are distributed here. Zero gas for recipients.
              Link your Solana wallet once — receive monthly rewards automatically.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['NUX Rewards', 'Zero Gas', 'Monthly Drops', 'SPL Tokens'].map(tag => (
                <span key={tag} className="jersey-20-regular text-base px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-300">{tag}</span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Gas Cost', value: 'Zero' },
                { label: 'Speed', value: '< 1 sec' },
                { label: 'TPS', value: '65,000+' },
              ].map((s, i) => (
                <div key={i} className="bg-green-500/10 rounded-xl p-3 text-center">
                  <div className="jersey-15-regular text-green-300 text-lg">{s.value}</div>
                  <div className="jersey-20-regular text-white/40 text-base">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bridge visual */}
        {!isMobile && (
          <motion.div {...fadeUp(0.25)} className="flex items-center justify-center gap-6 mb-12">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-purple-500/20" />
            <div className="card-unified px-6 py-3 flex items-center gap-3">
              <span className="text-2xl">🔄</span>
              <span className="jersey-20-regular text-white/70 text-lg">Off-chain link — no bridge, no gas</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-green-500/50 to-green-500/20" />
          </motion.div>
        )}

        {/* CTA */}
        <motion.div {...fadeUp(0.35)} className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-center'} gap-4`}>
          <Link to="/rewards" className="btn-primary jersey-20-regular text-xl px-10 py-4 rounded-xl inline-flex items-center gap-2 justify-center">
            🔗 Link Wallets Now
          </Link>
          <Link to="/about" className="jersey-20-regular text-xl px-10 py-4 rounded-xl inline-flex items-center gap-2 justify-center border border-green-500/40 hover:border-green-400 hover:bg-green-500/10 transition-all text-green-300">
            Learn Architecture →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default CrossChainSection;
