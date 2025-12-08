import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

function StakingSection() {
  const [stakingAmount, setStakingAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState('30');
  const [isCalculatorExpanded, setIsCalculatorExpanded] = useState(false);
  const isMobile = useIsMobile();

  // Staking calculator logic - APY values from EnhancedSmartStakingRewards.sol
  // Lockup periods: 0 (Flexible), 30, 90, 180, 365 days
  // Base APYs from contract: 263, 438, 788, 1051, 1577 (in basis points)
  // Hourly rates from contract comments: 0.003%, 0.005%, 0.009%, 0.012%, 0.018%
  const getAPYData = () => {
    switch (lockPeriod) {
      case '30': return { apy: 43.8, hourlyRate: 0.005 }; // 43.8% APY = 0.005% per hour
      case '90': return { apy: 78.8, hourlyRate: 0.009 }; // 78.8% APY = 0.009% per hour
      case '180': return { apy: 105.12, hourlyRate: 0.012 }; // 105.12% APY = 0.012% per hour
      case '365': return { apy: 157.68, hourlyRate: 0.018 }; // 157.68% APY = 0.018% per hour
      case 'flexible':
      default: return { apy: 26.3, hourlyRate: 0.003 }; // 26.3% APY = 0.003% per hour
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
        {/* Calculadora de Staking - Izquierda */}
        <motion.div
          className="order-2 lg:order-1"
          initial={{ opacity: 0, y: isMobile ? 20 : 0, x: isMobile ? 0 : -30 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-4 md:p-6 border border-white/10 hover:border-purple-400/50 transition-all duration-300">
            {/* Header con Botón Expandir/Contraer */}
            <div className={`flex items-center mb-6 ${isMobile && !isCalculatorExpanded ? 'justify-center' : 'justify-between'}`}>
              <h3 className="text-xl md:text-2xl font-bold text-white">Staking Calculator</h3>
              {isMobile && (
                <button
                  onClick={() => setIsCalculatorExpanded(!isCalculatorExpanded)}
                  className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors absolute right-4 md:right-8"
                  aria-label="Toggle calculator"
                >
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-purple-400"
                    animate={{ rotate: isCalculatorExpanded ? 180 : 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </motion.svg>
                </button>
              )}
            </div>

            {/* Contenido Colapsable */}
            <motion.div
              initial={isMobile ? { maxHeight: 0, opacity: 0 } : undefined}
              animate={
                isMobile
                  ? {
                      maxHeight: isCalculatorExpanded ? 1200 : 0,
                      opacity: isCalculatorExpanded ? 1 : 0,
                    }
                  : { maxHeight: 'auto', opacity: 1 }
              }
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className={`overflow-hidden ${isMobile && !isCalculatorExpanded ? 'hidden' : ''}`}
            >
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
                    <option value="flexible" className="bg-gray-800">Flexible (26.3% APY)</option>
                    <option value="30" className="bg-gray-800">30 Days (43.8% APY)</option>
                    <option value="90" className="bg-gray-800">90 Days (78.8% APY)</option>
                    <option value="180" className="bg-gray-800">180 Days (105.12% APY)</option>
                    <option value="365" className="bg-gray-800">365 Days (157.68% APY)</option>
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
                      Base APY: {getAPYData().apy.toFixed(2)}% • ROI: {(getAPYData().hourlyRate).toFixed(4)}% per hour
                    </div>
                    <div className="text-sm text-purple-300 font-semibold">
                      Effective APY: {getAPYData().apy.toFixed(2)}%
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
            </motion.div>
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
                <span className="text-white/80">Base APY 26.3% (Flexible staking)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-white/80">APY up to 157.68% (365 days lock)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-white/80">Multiple lock periods: 30, 90, 180, 365 days</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-white/80">Skill boosts and gamification rewards</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default StakingSection;