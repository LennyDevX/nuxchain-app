import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

function StakingSection() {
  const [stakingAmount, setStakingAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState('30');
  const isMobile = useIsMobile();

  // Staking calculator logic - APY values from stakingConstants.ts
  // Updated Mar 2026 - v6.2 rates (sustainability model)
  // Lockup periods: 0 (Flexible), 30, 90, 180, 365 days
  // Hourly rates calculated from v6.2 APY
  const getAPYData = () => {
    switch (lockPeriod) {
      case '30': return { apy: 17.2, hourlyRate: 0.001963 }; // 17.2% APY
      case '90': return { apy: 22.7, hourlyRate: 0.002591 }; // 22.7% APY
      case '180': return { apy: 30.3, hourlyRate: 0.003459 }; // 30.3% APY
      case '365': return { apy: 31.9, hourlyRate: 0.003641 }; // 31.9% APY
      case 'flexible':
      default: return { apy: 9.6, hourlyRate: 0.001096 }; // 9.6% APY
    }
  };

  const calculateProjectedRewards = (days: number) => {
    if (!stakingAmount || isNaN(Number(stakingAmount))) return 0;
    const amount = Number(stakingAmount);
    const { hourlyRate } = getAPYData();
    const hours = days * 24;
    return amount * hourlyRate * hours;
  };

  return (
    <section className={`relative z-10 border-t border-white/5 ${isMobile ? 'py-6' : 'py-24'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div {...fadeUp()} className={`text-center mb-6 ${isMobile ? 'mb-4' : 'mb-12'}`}>
          <span className="jersey-20-regular text-purple-400 text-xl uppercase tracking-widest">Staking</span>
          <h2 className={`jersey-15-regular text-white mt-2 mb-4 ${isMobile ? 'text-4xl' : 'text-5xl lg:text-7xl'}`}>
            Secure <span className="text-gradient">Staking</span>
          </h2>
          <p className={`jersey-20-regular text-white/60 max-w-2xl mx-auto ${isMobile ? 'text-lg' : 'text-2xl'}`}>
            Earn rewards by staking your POL tokens with up to 31.9% APY. Smart contracts, fully decentralized, with skill boosts and gamification.
          </p>
        </motion.div>

        {/* APY Tiers */}
        <motion.div {...fadeUp(0.1)} className={`grid gap-3 mb-8 ${isMobile ? 'grid-cols-3' : 'grid-cols-5'}`}>
          {[
            { period: 'Flexible', apy: '~9.6%', color: 'purple' },
            { period: '30 Days', apy: '~17.2%', color: 'blue' },
            { period: '90 Days', apy: '~22.7%', color: 'cyan' },
            { period: '180 Days', apy: '~30.3%', color: 'green' },
            { period: '365 Days', apy: '~31.9%', color: 'amber' },
          ].map((tier, i) => (
            <div
              key={i}
              onClick={() => setLockPeriod(i === 0 ? 'flexible' : String([30, 90, 180, 365][i - 1]))}
              className={`card-unified p-4 text-center cursor-pointer transition-all hover:scale-105 ${lockPeriod === (i === 0 ? 'flexible' : String([30, 90, 180, 365][i - 1])) ? 'border-purple-400/60 bg-purple-500/10' : ''}`}
            >
              <div className={`jersey-15-regular text-${tier.color}-300 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{tier.apy}</div>
              <div className="jersey-20-regular text-white/50 text-base mt-1">{tier.period}</div>
            </div>
          ))}
        </motion.div>

        <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'lg:grid-cols-2 gap-12'} items-start`}>

          {/* Calculator */}
          <motion.div {...fadeUp(0.15)} className="card-unified p-6">
            <h3 className={`jersey-15-regular text-white mb-6 ${isMobile ? 'text-3xl' : 'text-4xl'}`}>🧮 Staking Calculator</h3>
            <div className="space-y-5">
              <div>
                <label className={`jersey-20-regular block text-white/70 mb-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>Amount to Stake (POL)</label>
                <input
                  type="number"
                  value={stakingAmount}
                  onChange={(e) => setStakingAmount(e.target.value)}
                  placeholder="100"
                  min="0"
                  step="0.01"
                  className={`w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white jersey-20-regular placeholder-white/40 focus:border-purple-400 focus:outline-none transition-colors ${isMobile ? 'text-xl' : 'text-2xl'}`}
                />
              </div>
              <div>
                <label className={`jersey-20-regular block text-white/70 mb-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>Lock Period</label>
                <select
                  value={lockPeriod}
                  onChange={(e) => setLockPeriod(e.target.value)}
                  className={`w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white jersey-20-regular focus:border-purple-400 focus:outline-none transition-colors ${isMobile ? 'text-xl' : 'text-2xl'}`}
                >
                  <option value="flexible" className="bg-gray-900">Flexible — ~9.6% APY</option>
                  <option value="30" className="bg-gray-900">30 Days — ~17.2% APY</option>
                  <option value="90" className="bg-gray-900">90 Days — ~22.7% APY</option>
                  <option value="180" className="bg-gray-900">180 Days — ~30.3% APY</option>
                  <option value="365" className="bg-gray-900">365 Days — ~31.9% APY</option>
                </select>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <p className={`jersey-20-regular text-purple-300 mb-3 text-center ${isMobile ? 'text-xl' : 'text-2xl'}`}>Projected Rewards</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: '24h', days: 1, decimals: 4 },
                    { label: '30 days', days: 30, decimals: 2 },
                    { label: '6 months', days: 180, decimals: 2 },
                    { label: '1 year', days: 365, decimals: 2 },
                  ].map((p) => (
                    <div key={p.label} className="bg-white/5 rounded-lg p-3 text-center">
                      <div className={`jersey-20-regular text-white/50 ${isMobile ? 'text-lg' : 'text-xl'}`}>{p.label}</div>
                      <div className={`jersey-15-regular text-purple-300 ${isMobile ? 'text-xl' : 'text-2xl'}`}>{calculateProjectedRewards(p.days).toFixed(p.decimals)} POL</div>
                    </div>
                  ))}
                </div>
                <p className={`jersey-20-regular text-white/40 text-center mt-3 ${isMobile ? 'text-lg' : 'text-xl'}`}>APY: {getAPYData().apy.toFixed(1)}%</p>
              </div>
              <Link to="/staking" className="btn-primary jersey-20-regular w-full text-xl py-4 rounded-xl text-center block">
                🚀 Start Staking
              </Link>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div {...fadeUp(0.2)} className={`${isMobile ? 'grid grid-cols-2 gap-4' : 'space-y-5'}`}>
            {[
              { icon: '🔒', title: 'Fully Decentralized', desc: 'Smart contracts on Polygon — no custodians, no middlemen. Your tokens, your control.' },
              { icon: '📈', title: 'Up to 31.9% APY', desc: 'Lock for 365 days to maximize your yield. Flexible staking available at ~9.6% APY.' },
              { icon: '🎮', title: 'Gamification Boosts', desc: 'Earn skill NFTs that multiply your staking rewards. The more you engage, the more you earn.' },
              { icon: '⚡', title: 'Instant Rewards', desc: 'Rewards accrue every hour. Claim anytime with minimal gas fees on Polygon.' },
            ].map((item, i) => (
              <div key={i} className={`card-unified p-5 ${isMobile ? 'flex flex-col items-center text-center gap-3' : 'flex gap-4 items-start'}`}>
                <span className={`${isMobile ? 'text-5xl' : 'text-4xl'} flex-shrink-0`}>{item.icon}</span>
                <div className={isMobile ? 'w-full' : ''}>
                  <h3 className={`jersey-15-regular text-white mb-1 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>{item.title}</h3>
                  <p className={`jersey-20-regular text-white/55 ${isMobile ? 'text-lg' : 'text-xl'}`}>{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default StakingSection;