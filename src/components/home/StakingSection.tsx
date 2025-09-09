import { useState } from 'react';

function StakingSection() {
  const [stakingAmount, setStakingAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState('30');
  
  // Staking calculator logic
  const getMultiplier = () => {
    switch (lockPeriod) {
      case '30': return 1.2;
      case '90': return 1.5;
      case '180': return 2.0;
      case '365': return 2.5;
      default: return 1;
    }
  };
  
  const calculateProjectedRewards = (days: number) => {
    if (!stakingAmount || isNaN(Number(stakingAmount))) return 0;
    const amount = Number(stakingAmount);
    
    const hourlyRate = 0.0001; // 0.01% per hour
    const multiplier = getMultiplier();
    const hours = days * 24;
    
    return amount * hourlyRate * multiplier * hours;
  };
  
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Calculadora de Staking - Izquierda */}
        <div className="order-2 lg:order-1">
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
                   <option value="30" className="bg-gray-800">30 Days (1.2x)</option>
                   <option value="90" className="bg-gray-800">90 Days (1.5x)</option>
                   <option value="180" className="bg-gray-800">180 Days (2.0x)</option>
                   <option value="365" className="bg-gray-800">365 Days (2.5x)</option>
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
                    Base ROI: 0.01% per hour • Multiplier: {getMultiplier()}x
                  </div>
                  <div className="text-sm text-purple-300 font-semibold">
                    Effective APY: {(getMultiplier() * 0.01 * 24 * 365).toFixed(2)}%
                  </div>
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-transform duration-200">
                Start Staking
              </button>
            </div>
          </div>
        </div>
        
        {/* Información - Derecha */}
        <div className="order-1 lg:order-2">
          <div className="animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Secure <span className="text-gradient">Staking</span>
            </h2>
            
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Earn rewards by staking your tokens safely and decentralized with the best market yields. 
              Our smart contract ensures maximum security and transparency for your investments.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-white/80">Up to 25% APY rewards</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-white/80">Flexible lock periods</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-white/80">Auto-compound rewards</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StakingSection;