import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

function StakingSection() {
  const [stakingAmount, setStakingAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState('30');
  const isMobile = useIsMobile();

  // Staking calculator logic
  // ROI base flexible: 0.005% por hora (0.00005)
  // Multiplicadores calculados según los nuevos ROIs por hora
  // 30d: 0.01% (2.0x), 90d: 0.014% (2.8x), 180d: 0.017% (3.4x), 365d: 0.021% (4.2x)
  const getMultiplier = () => {
    switch (lockPeriod) {
      case '30': return 2.0;
      case '90': return 2.8;
      case '180': return 3.4;
      case '365': return 4.2;
      case 'flexible':
      default: return 1;
    }
  };

  const calculateProjectedRewards = (days: number) => {
    if (!stakingAmount || isNaN(Number(stakingAmount))) return 0;
    const amount = Number(stakingAmount);
    const hourlyRate = 0.00005; // 0.005% por hora
    const multiplier = getMultiplier();
    const hours = days * 24;
    return amount * hourlyRate * multiplier * hours;
  };

  return (
    <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-12' : 'py-20'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Calculadora de Staking - Izquierda */}
        <motion.div
          className="order-2 lg:order-1"
          initial={{ opacity: 0, y: isMobile ? 20 : 0, x: isMobile ? 0 : -30 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-4 md:p-8 border border-white/10 hover:border-purple-400/50 transition-all duration-300">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-6 text-center">Staking Calculator</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-white/80 mb-2 font-medium">Amount to Stake (POL)</label>
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
                <label className="block text-white/80 mb-2 font-medium">Lock Period</label>
                <select
                  value={lockPeriod}
                  onChange={(e) => setLockPeriod(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-purple-400 focus:outline-none transition-colors"
                >
                  <option value="flexible" className="bg-gray-800">Flexible (1x)</option>
                  <option value="30" className="bg-gray-800">30 Days (2.0x)</option>
                  <option value="90" className="bg-gray-800">90 Days (2.8x)</option>
                  <option value="180" className="bg-gray-800">180 Days (3.4x)</option>
                  <option value="365" className="bg-gray-800">365 Days (4.2x)</option>
                </select>
              </div>

              {/* Rewards Projections */}
              <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl p-4 border border-purple-400/20">
                <h4 className="text-sm font-semibold text-purple-300 text-center mb-4">Projected Rewards</h4>

                <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-white/60 mb-1">24 Hours</div>
                    <div className="text-purple-400 font-bold">
                      {calculateProjectedRewards(1).toFixed(4)} POL
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-white/60 mb-1">30 Days</div>
                    <div className="text-purple-400 font-bold">
                      {calculateProjectedRewards(30).toFixed(2)} POL
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-white/60 mb-1">6 Months</div>
                    <div className="text-purple-400 font-bold">
                      {calculateProjectedRewards(180).toFixed(2)} POL
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-white/60 mb-1">1 Year</div>
                    <div className="text-purple-400 font-bold">
                      {calculateProjectedRewards(365).toFixed(2)} POL
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-white/10 mt-4">
                  <div className="text-xs text-white/50 mb-1">
                    Base ROI: 0.005% per hour • Multiplier: {getMultiplier()}x
                  </div>
                  <div className="text-sm text-purple-300 font-semibold">
                    Effective APY: {(getMultiplier() * 0.005 * 24 * 365).toFixed(2)}%
                  </div>
                </div>
              </div>

              <Link
                to="/staking"
                className="w-full btn-primary inline-block text-center"
              >
                Start Staking
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Información - Derecha */}
        <motion.div
          className="order-1 lg:order-2"
          initial={{ opacity: 0, x: isMobile ? 0 : 30, y: isMobile ? 20 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="animate-slide-up">
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Secure <span className="text-gradient">Staking</span>
            </motion.h2>

            <motion.p
              className="text-xl text-white/80 mb-8 leading-relaxed"
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
                <span className="text-white/80">Base APY ~44% anual rewards (Flexible)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-white/80">APY máximo ~184% (365 días)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-white/80">Flexible lock periods</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-white/80">Auto-compound rewards system </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default StakingSection;