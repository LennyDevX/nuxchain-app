import React, { memo } from 'react'
import { useIsMobile } from '../../hooks/mobile'

interface Bond {
  id: string
  name: string
  duration: number // days
  apy: number
  minAmount: number
  maxAmount: number
  description: string
  risk: 'Low' | 'Medium' | 'High'
  available: boolean
}

const StakingBonds: React.FC = memo(() => {
  const isMobile = useIsMobile()

  const bonds: Bond[] = [
    {
      id: 'bond-30',
      name: 'Short Term Bond',
      duration: 30,
      apy: 50.0,
      minAmount: 100,
      maxAmount: 10000,
      description: 'Perfect for short-term investors looking for quick returns with moderate risk.',
      risk: 'Low',
      available: true
    },
    {
      id: 'bond-90',
      name: 'Medium Term Bond',
      duration: 90,
      apy: 100.0,
      minAmount: 500,
      maxAmount: 50000,
      description: 'Balanced option offering higher returns for medium-term commitment.',
      risk: 'Medium',
      available: true
    },
    {
      id: 'bond-180',
      name: 'Long Term Bond',
      duration: 180,
      apy: 160.0,
      minAmount: 1000,
      maxAmount: 100000,
      description: 'Maximum returns for long-term holders with higher risk tolerance.',
      risk: 'Medium',
      available: true
    },
    {
      id: 'bond-365',
      name: 'Premium Bond',
      duration: 365,
      apy: 300.0,
      minAmount: 5000,
      maxAmount: 500000,
      description: 'Exclusive bond for serious investors seeking maximum annual returns.',
      risk: 'High',
      available: true
    }
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-400 bg-green-500/20'
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'High': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <div className="card-unified">
      <div className={`flex items-center justify-between mb-6 ${
        isMobile ? 'flex-col space-y-3' : ''
      }`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h3 className={`font-bold text-white ${
            isMobile ? 'text-xl' : 'text-2xl'
          }`}>Staking Options</h3>
          <p className={`text-white/60 mt-1 ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>Available lockup periods and rewards (select period in Staking Form)</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">Live</span>
        </div>
      </div>

      <div className={`grid gap-4 ${
        isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2 gap-6'
      }`}>
        {bonds.map((bond) => (
          <div
            key={bond.id}
            className={`card-unified relative overflow-hidden ${
              isMobile ? 'p-3 bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-xl' : 'p-6'
            }`}
          >
            {/* Mobile: Compact Header */}
            {isMobile ? (
              <div className="text-center mb-3">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <div className={`w-2 h-2 rounded-full ${getRiskColor(bond.risk).includes('green') ? 'bg-green-400' : getRiskColor(bond.risk).includes('yellow') ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                  <h4 className="text-white font-bold text-sm">{bond.name.replace(' Bond', '')}</h4>
                </div>
                <p className="text-white/70 text-xs">{bond.duration}d</p>
              </div>
            ) : (
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-white font-semibold text-lg">{bond.name}</h4>
                  <p className="text-white/60 text-sm">{bond.duration} days</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400 text-2xl">{bond.apy}%</p>
                  <p className="text-white/60 text-xs">APY</p>
                </div>
              </div>
            )}

            {/* Mobile: Compact APY Display */}
            {isMobile && (
              <div className="text-center mb-3">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                  <p className="font-bold text-green-400 text-xl">{bond.apy}%</p>
                  <p className="text-green-300/80 text-xs">APY</p>
                </div>
              </div>
            )}

            {/* Mobile: Compact Risk and Limits */}
            {isMobile ? (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium text-xs ${getRiskColor(bond.risk)}`}>
                    {bond.risk}
                  </span>
                </div>
                <div className="bg-white/5 rounded-lg p-2 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-xs">Min:</span>
                    <span className="text-white font-medium text-xs">{bond.minAmount >= 1000 ? `${(bond.minAmount/1000)}K` : bond.minAmount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-xs">Max:</span>
                    <span className="text-white font-medium text-xs">{bond.maxAmount >= 1000 ? `${(bond.maxAmount/1000)}K` : bond.maxAmount}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full font-medium text-xs ${getRiskColor(bond.risk)}`}>
                  {bond.risk} Risk
                </span>
                <div className="text-right">
                  <p className="text-white/60 text-xs">Min: {bond.minAmount} POL</p>
                  <p className="text-white/60 text-xs">Max: {bond.maxAmount.toLocaleString()} POL</p>
                </div>
              </div>
            )}

            {!isMobile && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-white/80 text-sm mb-4">{bond.description}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Daily Reward:</span>
                    <span className="text-white">{(bond.apy / 365).toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Total Return:</span>
                    <span className="text-green-400 font-medium">
                      {((bond.apy / 365) * bond.duration).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {isMobile && (
              <div className="mt-3 pt-2 border-t border-white/20">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center bg-white/5 rounded p-1.5">
                    <p className="text-white/70 text-xs">Daily</p>
                    <p className="text-white font-semibold text-xs">{(bond.apy / 365).toFixed(2)}%</p>
                  </div>
                  <div className="text-center bg-green-500/10 rounded p-1.5">
                    <p className="text-green-300/80 text-xs">Total</p>
                    <p className="text-green-400 font-bold text-xs">
                      {((bond.apy / 365) * bond.duration).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bond Benefits */}
      <div className="mt-8 pt-6 border-t border-white/20">
        <h4 className="text-white font-semibold mb-6">Bond Benefits</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Higher APY</p>
              <p className="text-white/60 text-xs">Up to 300% returns</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Guaranteed Lock</p>
              <p className="text-white/60 text-xs">Secure commitment</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Compound Interest</p>
              <p className="text-white/60 text-xs">Auto-reinvestment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

StakingBonds.displayName = 'StakingBonds'

export default StakingBonds