import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

const tokenStats = [
  { label: 'Total Supply', value: '100M', sub: 'NUX Tokens' },
  { label: 'Rewards Pool', value: '20%', sub: '20M NUX' },
  { label: 'Presale', value: '15%', sub: '15M NUX' },
  { label: 'Liquidity', value: '15%', sub: '15M NUX' },
];

const tokenFeatures = [
  { icon: '🏆', title: 'Monthly Rewards', desc: 'Distributed to active users via the NUX Rewards Hub every 30 days.' },
  { icon: '🔷', title: 'Polygon Native', desc: 'Activity tracked on Polygon — ultra-fast, ultra-cheap transactions.' },
  { icon: '◎', title: 'Solana Distribution', desc: 'Rewards sent as SPL tokens to your Solana wallet. Zero gas for recipients.' },
  { icon: '📈', title: 'Staking Utility', desc: 'Stake NUX for governance rights and ecosystem fee discounts.' },
];

function NuxTokenSection() {
  const isMobile = useIsMobile();

  return (
    <section className={`relative z-10 border-t border-white/5 ${isMobile ? 'py-14' : 'py-24'} overflow-hidden`}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div {...fadeUp()} className="text-center mb-14">
          <span className="jersey-20-regular text-amber-400 text-lg uppercase tracking-widest">Token</span>
          <h2 className={`jersey-15-regular text-white mt-2 mb-4 ${isMobile ? 'text-4xl' : 'text-5xl lg:text-6xl'}`}>
            The <span className="text-gradient">NUX Token</span>
          </h2>
          <p className={`jersey-20-regular text-white/60 max-w-2xl mx-auto ${isMobile ? 'text-lg' : 'text-xl'}`}>
            NUX is the native utility token powering the entire Nuxchain ecosystem —
            rewards, governance, staking, and cross-chain distribution.
          </p>
        </motion.div>

        <div className={`grid ${isMobile ? 'grid-cols-1 gap-10' : 'lg:grid-cols-2 gap-16'} items-center mb-14`}>

          {/* Left — Logo + Stats */}
          <motion.div {...fadeUp(0.1)} className="flex flex-col items-center gap-8">
            {/* NUX Logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-3xl scale-150" />
              <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full border-2 border-amber-500/40 overflow-hidden bg-black/40 flex items-center justify-center shadow-2xl"
                style={{ boxShadow: '0 0 60px rgba(245,158,11,0.3)' }}>
                <img
                  src="/assets/tokens/NuxLogo.png"
                  alt="NUX Token"
                  className="w-full h-full object-contain p-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="jersey-15-regular text-amber-300 text-5xl">NUX</span>';
                  }}
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className={`grid gap-3 w-full max-w-sm ${isMobile ? 'grid-cols-2' : 'grid-cols-2'}`}>
              {tokenStats.map((stat, i) => (
                <motion.div key={i} {...fadeUp(0.15 + i * 0.07)} className="card-unified p-4 text-center">
                  <div className={`jersey-15-regular text-amber-300 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{stat.value}</div>
                  <div className="jersey-20-regular text-white text-base">{stat.label}</div>
                  <div className="jersey-20-regular text-white/40 text-base">{stat.sub}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Features */}
          <div className="space-y-4">
            {tokenFeatures.map((f, i) => (
              <motion.div key={i} {...fadeUp(0.1 + i * 0.09)} className="card-unified p-5 flex gap-4 items-start">
                <span className="text-3xl flex-shrink-0">{f.icon}</span>
                <div>
                  <h3 className={`jersey-15-regular text-white mb-1 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{f.title}</h3>
                  <p className={`jersey-20-regular text-white/55 ${isMobile ? 'text-base' : 'text-lg'}`}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div {...fadeUp(0.4)} className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-center'} gap-4`}>
          <Link to="/nux" className="btn-primary jersey-20-regular text-xl px-10 py-4 rounded-xl inline-flex items-center gap-2 justify-center">
            🏅 View NUX Token
          </Link>
          <Link to="/tokenomics" className="jersey-20-regular text-xl px-10 py-4 rounded-xl inline-flex items-center gap-2 justify-center border border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/10 transition-all text-amber-300">
            📊 Tokenomics →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default NuxTokenSection;
