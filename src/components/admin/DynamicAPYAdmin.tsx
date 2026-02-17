/**
 * DynamicAPYAdmin - Admin controls for DynamicAPYCalculator contract
 * Provides UI for managing APY configuration, target TVL, and emergency controls
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDynamicAPYAdmin } from '../../hooks/apy/useDynamicAPYAdmin';

export default function DynamicAPYAdmin() {
  const {
    // Admin functions
    setTargetTVL,
    setAPYMultiplierBounds,
    setDynamicAPYEnabled,
    setTreasuryManager,
    pauseContract,
    unpauseContract,
    
    // Read data
    currentTargetTVL,
    currentMinMultiplier,
    currentMaxMultiplier,
    isDynamicAPYEnabled,
    treasuryManagerAddress,
    contractPaused,
    
    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    txHash,
    error,
  } = useDynamicAPYAdmin();

  // Form states with initial values from contract
  const [newTargetTVL, setNewTargetTVL] = useState(currentTargetTVL || '');
  const [minMultiplier, setMinMultiplier] = useState(currentMinMultiplier?.toString() || '30');
  const [maxMultiplier, setMaxMultiplier] = useState(currentMaxMultiplier?.toString() || '100');
  const [newTreasuryManager, setNewTreasuryManager] = useState(treasuryManagerAddress || '');
  const [activeSection, setActiveSection] = useState<'target' | 'bounds' | 'toggle' | 'treasury' | 'emergency'>('target');

  // Update form values only when contract data changes and form is empty/default
  useEffect(() => {
    if (currentTargetTVL && !newTargetTVL) {
      setNewTargetTVL(currentTargetTVL);
    }
    if (currentMinMultiplier && minMultiplier === '30') {
      setMinMultiplier(currentMinMultiplier.toString());
    }
    if (currentMaxMultiplier && maxMultiplier === '100') {
      setMaxMultiplier(currentMaxMultiplier.toString());
    }
    if (treasuryManagerAddress && !newTreasuryManager) {
      setNewTreasuryManager(treasuryManagerAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTargetTVL, currentMinMultiplier, currentMaxMultiplier, treasuryManagerAddress]);

  // Reset form after successful transaction
  useEffect(() => {
    if (isConfirmed) {
      // Optional: Show success toast
    }
  }, [isConfirmed]);

  const handleSetTargetTVL = () => {
    if (newTargetTVL && parseFloat(newTargetTVL) > 0) {
      setTargetTVL(newTargetTVL);
    }
  };

  const handleSetBounds = () => {
    const min = parseFloat(minMultiplier);
    const max = parseFloat(maxMultiplier);
    if (min > 0 && max > 0 && min < max && max <= 100) {
      setAPYMultiplierBounds(min, max);
    }
  };

  const handleSetTreasuryManager = () => {
    if (newTreasuryManager && newTreasuryManager.startsWith('0x') && newTreasuryManager.length === 42) {
      setTreasuryManager(newTreasuryManager);
    }
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Dynamic APY Controller</h2>
            <p className="text-xs text-slate-400">Manage APY calculation parameters</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isDynamicAPYEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
          <span className={`text-xs font-medium ${isDynamicAPYEnabled ? 'text-emerald-400' : 'text-red-400'}`}>
            {isDynamicAPYEnabled ? 'Active' : 'Disabled'}
          </span>
          {contractPaused && (
            <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30">
              PAUSED
            </span>
          )}
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p className="text-xs text-slate-400 mb-1">Target TVL</p>
          <p className="text-sm font-semibold text-white">{parseFloat(currentTargetTVL).toLocaleString()} POL</p>
        </div>
        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p className="text-xs text-slate-400 mb-1">Min Multiplier</p>
          <p className="text-sm font-semibold text-white">{currentMinMultiplier.toFixed(1)}%</p>
        </div>
        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p className="text-xs text-slate-400 mb-1">Max Multiplier</p>
          <p className="text-sm font-semibold text-white">{currentMaxMultiplier.toFixed(1)}%</p>
        </div>
        <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
          <p className="text-xs text-slate-400 mb-1">Status</p>
          <p className="text-sm font-semibold text-white">{contractPaused ? 'Paused' : isDynamicAPYEnabled ? 'Dynamic' : 'Static'}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'target', label: 'Target TVL', icon: '🎯' },
          { id: 'bounds', label: 'Multiplier Bounds', icon: '⚖️' },
          { id: 'toggle', label: 'Toggle Dynamic', icon: '🔘' },
          { id: 'treasury', label: 'Treasury Manager', icon: '🏦' },
          { id: 'emergency', label: 'Emergency', icon: '🚨' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSection === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700 hover:text-slate-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Target TVL Section */}
        {activeSection === 'target' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
              <h3 className="text-sm font-medium text-white mb-2">Update Target TVL</h3>
              <p className="text-xs text-slate-400 mb-4">
                Current: <span className="text-cyan-400">{parseFloat(currentTargetTVL).toLocaleString()} POL</span>
                <br />
                <span className="text-slate-500">Limits: Max 50% change per transaction (500K-1.5M if current is 1M)</span>
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">New Target TVL (POL)</label>
                  <input
                    type="number"
                    value={newTargetTVL}
                    onChange={(e) => setNewTargetTVL(e.target.value)}
                    placeholder="e.g., 250000"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    min="100"
                    max="100000000"
                  />
                </div>
                
                <button
                  onClick={handleSetTargetTVL}
                  disabled={isPending || isConfirming || !newTargetTVL}
                  className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Submitting...' : isConfirming ? 'Confirming...' : 'Update Target TVL'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Multiplier Bounds Section */}
        {activeSection === 'bounds' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
              <h3 className="text-sm font-medium text-white mb-2">Update Multiplier Bounds</h3>
              <p className="text-xs text-slate-400 mb-4">
                Current: <span className="text-cyan-400">{currentMinMultiplier.toFixed(1)}% - {currentMaxMultiplier.toFixed(1)}%</span>
                <br />
                <span className="text-slate-500">Range: 10%-100%, min 10% spread between min and max</span>
              </p>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Min Multiplier (%)</label>
                    <input
                      type="number"
                      value={minMultiplier}
                      onChange={(e) => setMinMultiplier(e.target.value)}
                      placeholder="30"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                      min="10"
                      max="90"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Max Multiplier (%)</label>
                    <input
                      type="number"
                      value={maxMultiplier}
                      onChange={(e) => setMaxMultiplier(e.target.value)}
                      placeholder="100"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
                      min="20"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleSetBounds}
                  disabled={isPending || isConfirming}
                  className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Submitting...' : isConfirming ? 'Confirming...' : 'Update Bounds'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Toggle Dynamic APY Section */}
        {activeSection === 'toggle' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
              <h3 className="text-sm font-medium text-white mb-2">Toggle Dynamic APY</h3>
              <p className="text-xs text-slate-400 mb-4">
                Current Mode: <span className={isDynamicAPYEnabled ? 'text-emerald-400' : 'text-amber-400'}>
                  {isDynamicAPYEnabled ? 'Dynamic (TVL-based)' : 'Static (Base rates)'}
                </span>
                <br />
                <span className="text-slate-500">
                  {isDynamicAPYEnabled 
                    ? 'APY adjusts based on TVL using inverse square root formula' 
                    : 'APY remains at base rates regardless of TVL'}
                </span>
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setDynamicAPYEnabled(!isDynamicAPYEnabled)}
                  disabled={isPending || isConfirming}
                  className={`w-full px-4 py-2 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDynamicAPYEnabled
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white'
                  }`}
                >
                  {isPending ? 'Submitting...' : isConfirming ? 'Confirming...' : isDynamicAPYEnabled ? 'Disable Dynamic APY' : 'Enable Dynamic APY'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Treasury Manager Section */}
        {activeSection === 'treasury' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
              <h3 className="text-sm font-medium text-white mb-2">Update Treasury Manager</h3>
              <p className="text-xs text-slate-400 mb-4">
                Current: <span className="text-cyan-400 font-mono">{treasuryManagerAddress || 'Not Set'}</span>
                <br />
                <span className="text-slate-500">Address that receives APY compression notifications</span>
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">New Treasury Manager Address</label>
                  <input
                    type="text"
                    value={newTreasuryManager}
                    onChange={(e) => setNewTreasuryManager(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                
                <button
                  onClick={handleSetTreasuryManager}
                  disabled={isPending || isConfirming || !newTreasuryManager}
                  className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Submitting...' : isConfirming ? 'Confirming...' : 'Update Treasury Manager'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Emergency Section */}
        {activeSection === 'emergency' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/30">
              <h3 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                <span>🚨</span> Emergency Controls
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Current Status: <span className={contractPaused ? 'text-red-400 font-semibold' : 'text-emerald-400'}>
                  {contractPaused ? 'Contract is PAUSED' : 'Contract is Active'}
                </span>
                <br />
                <span className="text-red-400/70">Warning: Pausing stops all APY calculations immediately</span>
              </p>
              
              <div className="space-y-3">
                {!contractPaused ? (
                  <button
                    onClick={pauseContract}
                    disabled={isPending || isConfirming}
                    className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? 'Submitting...' : isConfirming ? 'Confirming...' : '⚠️ Pause Contract'}
                  </button>
                ) : (
                  <button
                    onClick={unpauseContract}
                    disabled={isPending || isConfirming}
                    className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? 'Submitting...' : isConfirming ? 'Confirming...' : '✅ Unpause Contract'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Transaction Status */}
      {(isPending || isConfirming || isConfirmed || error) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-lg border"
        >
          {isPending && (
            <div className="flex items-center space-x-2 text-amber-400">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Transaction pending...</span>
            </div>
          )}
          {isConfirming && (
            <div className="flex items-center space-x-2 text-blue-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Confirming transaction...</span>
            </div>
          )}
          {isConfirmed && (
            <div className="flex items-center space-x-2 text-emerald-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">Transaction confirmed!</span>
            </div>
          )}
          {error && (
            <div className="flex items-center space-x-2 text-red-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm">{error.message}</span>
            </div>
          )}
          {txHash && (
            <div className="mt-2 text-xs text-slate-400">
              TX: <span className="font-mono text-slate-300">{txHash.slice(0, 12)}...{txHash.slice(-8)}</span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
