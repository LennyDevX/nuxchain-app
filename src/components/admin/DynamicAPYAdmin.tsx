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
      className="card-unified rounded-xl border border-[rgba(139,92,246,0.2)] overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.25)] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Dynamic APY Controller</h3>
            <p className="text-[10px] text-slate-500">Manage APY calculation parameters</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
            isDynamicAPYEnabled
              ? 'text-[#10b981] border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.1)]'
              : 'text-red-400 border-red-500/30 bg-red-500/10'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isDynamicAPYEnabled ? 'bg-[#10b981] animate-pulse' : 'bg-red-400'}`} />
            {isDynamicAPYEnabled ? 'Active' : 'Disabled'}
          </span>
          {contractPaused && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 border border-red-500/20 text-red-400">
              PAUSED
            </span>
          )}
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 border-b border-[rgba(255,255,255,0.05)]">
        <div className="card-stats rounded-xl p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Target TVL</p>
          <p className="text-sm font-bold text-white">{parseFloat(currentTargetTVL).toLocaleString()} POL</p>
        </div>
        <div className="card-stats rounded-xl p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Min Multiplier</p>
          <p className="text-sm font-bold text-white">{currentMinMultiplier.toFixed(1)}%</p>
        </div>
        <div className="card-stats rounded-xl p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Max Multiplier</p>
          <p className="text-sm font-bold text-white">{currentMaxMultiplier.toFixed(1)}%</p>
        </div>
        <div className="card-stats rounded-xl p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Status</p>
          <p className="text-sm font-bold text-white">{contractPaused ? 'Paused' : isDynamicAPYEnabled ? 'Dynamic' : 'Static'}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 px-5 pt-4">
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
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSection === tab.id
                ? 'bg-[rgba(139,92,246,0.2)] text-[#8b5cf6] border border-[rgba(139,92,246,0.3)]'
                : 'bg-[#0a0a0a]/60 text-slate-500 border border-white/5 hover:bg-[#0a0a0a] hover:text-slate-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="p-5 space-y-4">
        {/* Target TVL Section */}
        {activeSection === 'target' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-content rounded-xl p-4 border border-[rgba(139,92,246,0.15)]"
          >
            <h3 className="text-sm font-bold text-white mb-1">Update Target TVL</h3>
            <p className="text-[10px] text-slate-400 mb-4">
              Current: <span className="text-[#8b5cf6]">{parseFloat(currentTargetTVL).toLocaleString()} POL</span>
              <br />
              <span className="text-slate-500">Limits: Max 50% change per transaction (500K-1.5M if current is 1M)</span>
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">New Target TVL (POL)</label>
                <input
                  type="number"
                  value={newTargetTVL}
                  onChange={(e) => setNewTargetTVL(e.target.value)}
                  placeholder="e.g., 250000"
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[rgba(139,92,246,0.4)] transition-colors"
                  min="100"
                  max="100000000"
                />
              </div>

              <button
                onClick={handleSetTargetTVL}
                disabled={isPending || isConfirming || !newTargetTVL}
                className="w-full px-4 py-2.5 bg-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.3)] border border-[rgba(139,92,246,0.3)] text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Submitting...' : isConfirming ? 'Confirming...' : 'Update Target TVL'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Multiplier Bounds Section */}
        {activeSection === 'bounds' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-content rounded-xl p-4 border border-[rgba(139,92,246,0.15)]"
          >
            <h3 className="text-sm font-bold text-white mb-1">Update Multiplier Bounds</h3>
            <p className="text-[10px] text-slate-400 mb-4">
              Current: <span className="text-[#8b5cf6]">{currentMinMultiplier.toFixed(1)}% - {currentMaxMultiplier.toFixed(1)}%</span>
              <br />
              <span className="text-slate-500">Range: 10%-100%, min 10% spread between min and max</span>
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Min Multiplier (%)</label>
                  <input
                    type="number"
                    value={minMultiplier}
                    onChange={(e) => setMinMultiplier(e.target.value)}
                    placeholder="30"
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[rgba(139,92,246,0.4)] transition-colors"
                    min="10"
                    max="90"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Max Multiplier (%)</label>
                  <input
                    type="number"
                    value={maxMultiplier}
                    onChange={(e) => setMaxMultiplier(e.target.value)}
                    placeholder="100"
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[rgba(139,92,246,0.4)] transition-colors"
                    min="20"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              <button
                onClick={handleSetBounds}
                disabled={isPending || isConfirming}
                className="w-full px-4 py-2.5 bg-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.3)] border border-[rgba(139,92,246,0.3)] text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Submitting...' : isConfirming ? 'Confirming...' : 'Update Bounds'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Toggle Dynamic APY Section */}
        {activeSection === 'toggle' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-content rounded-xl p-4 border border-[rgba(139,92,246,0.15)]"
          >
            <h3 className="text-sm font-bold text-white mb-1">Toggle Dynamic APY</h3>
            <p className="text-[10px] text-slate-400 mb-4">
              Current Mode: <span className={isDynamicAPYEnabled ? 'text-[#10b981]' : 'text-amber-400'}>
                {isDynamicAPYEnabled ? 'Dynamic (TVL-based)' : 'Static (Base rates)'}
              </span>
              <br />
              <span className="text-slate-500">
                {isDynamicAPYEnabled
                  ? 'APY adjusts based on TVL using inverse square root formula'
                  : 'APY remains at base rates regardless of TVL'}
              </span>
            </p>

            <button
              onClick={() => setDynamicAPYEnabled(!isDynamicAPYEnabled)}
              disabled={isPending || isConfirming}
              className={`w-full px-4 py-2.5 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isDynamicAPYEnabled
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400'
                  : 'bg-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.3)] border border-[rgba(139,92,246,0.3)] text-white'
              }`}
            >
              {isPending ? 'Submitting...' : isConfirming ? 'Confirming...' : isDynamicAPYEnabled ? 'Disable Dynamic APY' : 'Enable Dynamic APY'}
            </button>
          </motion.div>
        )}

        {/* Treasury Manager Section */}
        {activeSection === 'treasury' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-content rounded-xl p-4 border border-[rgba(139,92,246,0.15)]"
          >
            <h3 className="text-sm font-bold text-white mb-1">Update Treasury Manager</h3>
            <p className="text-[10px] text-slate-400 mb-4 break-all">
              Current: <span className="text-[#8b5cf6] font-mono">{treasuryManagerAddress || 'Not Set'}</span>
              <br />
              <span className="text-slate-500">Address that receives APY compression notifications</span>
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">New Treasury Manager Address</label>
                <input
                  type="text"
                  value={newTreasuryManager}
                  onChange={(e) => setNewTreasuryManager(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-[rgba(139,92,246,0.4)] transition-colors"
                />
              </div>

              <button
                onClick={handleSetTreasuryManager}
                disabled={isPending || isConfirming || !newTreasuryManager}
                className="w-full px-4 py-2.5 bg-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.3)] border border-[rgba(139,92,246,0.3)] text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Submitting...' : isConfirming ? 'Confirming...' : 'Update Treasury Manager'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Emergency Section */}
        {activeSection === 'emergency' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-content rounded-xl p-4 border border-red-500/20 bg-red-500/5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🚨</span>
              <h3 className="text-sm font-bold text-red-400">Emergency Controls</h3>
            </div>
            <p className="text-[10px] text-slate-400 mb-4">
              Current Status: <span className={contractPaused ? 'text-red-400 font-bold' : 'text-[#10b981]'}>
                {contractPaused ? 'Contract is PAUSED' : 'Contract is Active'}
              </span>
              <br />
              <span className="text-red-400/70">Warning: Pausing stops all APY calculations immediately</span>
            </p>

            {!contractPaused ? (
              <button
                onClick={pauseContract}
                disabled={isPending || isConfirming}
                className="w-full px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Submitting...' : isConfirming ? 'Confirming...' : '⚠️ Pause Contract'}
              </button>
            ) : (
              <button
                onClick={unpauseContract}
                disabled={isPending || isConfirming}
                className="w-full px-4 py-2.5 bg-[#10b981]/20 hover:bg-[#10b981]/30 border border-[#10b981]/30 text-[#10b981] text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Submitting...' : isConfirming ? 'Confirming...' : '✅ Unpause Contract'}
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Transaction Status */}
      {(isPending || isConfirming || isConfirmed || error) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 mx-5 mb-5 p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[#0a0a0a]/50"
        >
          {isPending && (
            <div className="flex items-center gap-2 text-amber-400">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Transaction pending...</span>
            </div>
          )}
          {isConfirming && (
            <div className="flex items-center gap-2 text-blue-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Confirming transaction...</span>
            </div>
          )}
          {isConfirmed && (
            <div className="flex items-center gap-2 text-[#10b981]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium">Transaction confirmed!</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-red-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm">{error.message}</span>
            </div>
          )}
          {txHash && (
            <div className="mt-2 text-[10px] text-slate-500">
              TX: <span className="font-mono text-slate-400">{txHash.slice(0, 12)}...{txHash.slice(-8)}</span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
