import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

function StakingSection() {
  const [stakingAmount, setStakingAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState('30');
  const isMobile = useIsMobile();

  // Staking calculator logic - APY values from stakingConstants.ts
  // Updated Feb 2025 - All rates reduced 25% on-chain for sustainability
  // Lockup periods: 0 (Flexible), 30, 90, 180, 365 days
  // Hourly rates: 0.00225%, 0.00375%, 0.00675%, 0.009%, 0.0135%
  const getAPYData = () => {
    switch (lockPeriod) {
      case '30': return { apy: 32.9, hourlyRate: 0.00375 }; // 32.9% APY = 0.00375% per hour
      case '90': return { apy: 59.1, hourlyRate: 0.00675 }; // 59.1% APY = 0.00675% per hour
      case '180': return { apy: 78.8, hourlyRate: 0.009 }; // 78.8% APY = 0.009% per hour
      case '365': return { apy: 118.3, hourlyRate: 0.0135 }; // 118.3% APY = 0.0135% per hour
      case 'flexible':
      default: return { apy: 19.7, hourlyRate: 0.00225 }; // 19.7% APY = 0.00225% per hour
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
    <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-12' : 'py-20'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Calculadora de Staking - Solo Desktop */}
        {!isMobile && (
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-4 md:p-6 border border-white/10 hover:border-purple-400/50 transition-all duration-300">
              <h3 className="jersey-15-regular text-xl md:text-2xl text-white mb-6">Staking Calculator</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="jersey-20-regular block text-white/80 mb-2">Amount to Stake (POL)</label>
                  <input
                    type="number"
                    value={stakingAmount}
                    onChange={(e) => setStakingAmount(e.target.value)}
                    placeholder="10"
                    min="0"
                    step="0.01"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="jersey-20-regular block text-white/80 mb-2">Lock Period</label>
                  <select
                    value={lockPeriod}
                    onChange={(e) => setLockPeriod(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-purple-400 focus:outline-none transition-colors"
                  >
                    <option value="flexible" className="bg-gray-800">Flexible (19.7% APY)</option>
                    <option value="30" className="bg-gray-800">30 Days (32.9% APY)</option>
                    <option value="90" className="bg-gray-800">90 Days (59.1% APY)</option>
                    <option value="180" className="bg-gray-800">180 Days (78.8% APY)</option>
                    <option value="365" className="bg-gray-800">365 Days (118.3% APY)</option>
                  </select>
                </div>

                {/* Rewards Projections */}
                <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl p-4 border border-purple-400/20">
                  <h4 className="jersey-15-regular text-sm text-purple-300 text-center mb-4">Projected Rewards</h4>

                  <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="jersey-20-regular text-white/60 mb-1">24 Hours</div>
                      <div className="jersey-20-regular text-purple-400">
                        {calculateProjectedRewards(1).toFixed(4)} POL
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="jersey-20-regular text-white/60 mb-1">30 Days</div>
                      <div className="jersey-20-regular text-purple-400">
                        {calculateProjectedRewards(30).toFixed(2)} POL
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="jersey-20-regular text-white/60 mb-1">6 Months</div>
                      <div className="jersey-20-regular text-purple-400">
                        {calculateProjectedRewards(180).toFixed(2)} POL
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="jersey-20-regular text-white/60 mb-1">1 Year</div>
                      <div className="jersey-20-regular text-purple-400">
                        {calculateProjectedRewards(365).toFixed(2)} POL
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-4 border-t border-white/10 mt-4">
                    <div className="jersey-20-regular text-xs text-white/50 mb-1">
                      Base APY: {getAPYData().apy.toFixed(2)}% • ROI: {(getAPYData().hourlyRate).toFixed(4)}% per hour
                    </div>
                    <div className="jersey-20-regular text-sm text-purple-300">
                      Effective APY: {getAPYData().apy.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <Link
                  to="/staking"
                  className="jersey-20-regular w-full btn-primary inline-block text-center text-xl"
                >
                  Start Staking
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Información - Derecha */}
        <motion.div
          className="order-1 lg:order-2"
          initial={{ opacity: 0, x: isMobile ? 0 : 30, y: isMobile ? 20 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="animate-slide-up">
            <motion.h2
              className="jersey-15-regular text-4xl md:text-7xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Secure <span className="text-gradient">Staking</span>
            </motion.h2>

            <motion.p
              className="jersey-20-regular text-xl text-white/80 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              Earn rewards by staking your tokens safely and decentralized with the best market yields.
              Our smart contract ensures maximum security and transparency for your investments.
            </motion.p>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="jersey-15-regular text-xl lg:text-2xl text-white/80">Base APY 19.7% (Flexible staking)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="jersey-15-regular text-xl lg:text-2xl text-white/80">APY up to 118.3% (365 days lock)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="jersey-15-regular text-xl lg:text-2xl text-white/80">Multiple lock periods: 30, 90, 180, 365 days</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="jersey-15-regular text-xl lg:text-2xl text-white/80">Skill boosts and gamification rewards</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default StakingSection;