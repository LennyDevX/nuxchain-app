/**
 * Contract Manager Tool
 * Dynamic contract management with auto-detection of contract type
 * Paste address → Auto-detect type → Show available tools
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useReadContract } from 'wagmi';
import EnhancedSmartStakingABI from '../../abi/SmartStaking/EnhancedSmartStakingCoreV2.json';

// Contract Types
export type ContractType = 'staking' | 'nft' | 'marketplace' | 'unknown';

interface ContractInfo {
  address: string;
  type: ContractType;
  name: string;
  isPaused?: boolean;
  balance?: string;
}

export default function ContractManager() {
  const [contractAddress, setContractAddress] = useState('');
  const [detectedContract, setDetectedContract] = useState<ContractInfo | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Validate and detect contract type
  const detectContractType = async (addr: string) => {
    setIsDetecting(true);
    setError('');
    
    try {
      // Validate address format
      if (!addr.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid contract address format');
      }

      // Check known contract addresses
      const stakingAddr = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS?.toLowerCase();
      const stakingViewerAddr = import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS?.toLowerCase();
      
      const lowerAddr = addr.toLowerCase();

      // Determine contract type and name
      let type: ContractType = 'unknown';
      let name = 'Unknown Contract';
      
      if (lowerAddr === stakingAddr) {
        type = 'staking';
        name = 'Smart Staking (Core)';
      } else if (lowerAddr === stakingViewerAddr) {
        type = 'staking';
        name = 'Smart Staking (Viewer)';
      }

      // Try to read contract balance
      let balance: string | undefined;
      try {
        const response = await fetch(`https://polygon.llamarpc.com`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [addr, 'latest'],
            id: 1,
          }),
        });
        
        const data = await response.json();
        if (data.result) {
          const balanceBigInt = BigInt(data.result);
          balance = (Number(balanceBigInt) / 1e18).toFixed(4);
        }
      } catch (e) {
        console.warn('Failed to fetch contract balance:', e);
      }

      const contractInfo: ContractInfo = {
        address: addr,
        type,
        name,
        balance,
      };
      
      setDetectedContract(contractInfo);
      setIsDetecting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect contract');
      setDetectedContract(null);
      setIsDetecting(false);
    }
  };

  const handleDetect = () => {
    if (contractAddress.trim()) {
      detectContractType(contractAddress.trim());
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>Contract Manager</span>
      </h3>

      {/* Address Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Contract Address
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={contractAddress}
            onChange={(e) => {
              setContractAddress(e.target.value);
              setDetectedContract(null);
              setError('');
            }}
            placeholder="0x..."
            className="flex-1 px-4 py-2 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleDetect}
            disabled={isDetecting || !contractAddress.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium text-white transition-all"
          >
            {isDetecting ? 'Detecting...' : 'Detect'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detected Contract Info */}
      <AnimatePresence>
        {detectedContract && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-green-400 font-semibold">{detectedContract.name}</p>
                <p className="text-gray-400 text-xs font-mono mt-1">
                  {detectedContract.address.slice(0, 10)}...{detectedContract.address.slice(-8)}
                </p>
              </div>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                {detectedContract.type}
              </span>
            </div>

            {detectedContract.balance && (
              <p className="text-gray-300 text-sm">
                💰 Balance: <span className="font-semibold">{detectedContract.balance} POL</span>
              </p>
            )}

            {/* Tools for Staking Contract */}
            {detectedContract.type === 'staking' && (
              <StakingContractTools 
                contractAddress={detectedContract.address}
                onSuccess={(msg) => setSuccess(msg)}
                onError={(msg) => setError(msg)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Staking Contract Tools
 * Pause/Unpause and Emergency Withdraw
 */
function StakingContractTools({ 
  contractAddress, 
  onSuccess, 
  onError 
}: { 
  contractAddress: string;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const { address: walletAddress } = useAccount();
  const [isPausedLoading, setIsPausedLoading] = useState(false);
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  // Read contract paused status
  const { data: isPaused } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: EnhancedSmartStakingABI.abi,
    functionName: 'paused',
  });

  // Read contract balance
  const { data: contractBalance } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: EnhancedSmartStakingABI.abi,
    functionName: 'getContractBalance',
  });

  // Handle Pause
  const handlePause = async () => {
    if (!walletAddress) {
      onError('Wallet not connected');
      return;
    }

    setIsPausedLoading(true);
    try {
      // This would need to be implemented with actual contract write
      // For now, showing the UI
      onSuccess(isPaused ? 'Contract unpaused successfully (simulate)' : 'Contract paused successfully (simulate)');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to toggle pause');
    } finally {
      setIsPausedLoading(false);
    }
  };

  // Handle Emergency Withdraw
  const handleEmergencyWithdraw = async () => {
    if (!walletAddress) {
      onError('Wallet not connected');
      return;
    }

    if (!confirmWithdraw) {
      onError('Please confirm the withdrawal first');
      return;
    }

    setIsWithdrawLoading(true);
    try {
      // This would need actual contract interaction
      // Showing placeholder logic
      const balanceNum = contractBalance ? Number(contractBalance) / 1e18 : 0;
      onSuccess(`Emergency withdrawal initiated (${balanceNum.toFixed(2)} POL will be transferred)`);
      setConfirmWithdraw(false);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to withdraw');
    } finally {
      setIsWithdrawLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 pt-4 border-t border-green-500/20 space-y-3"
    >
      <h4 className="text-white font-semibold text-sm mb-3">Available Tools:</h4>

      {/* Pause/Unpause Tool */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePause}
        disabled={isPausedLoading}
        className={`w-full p-3 rounded-lg font-medium transition-all flex items-center justify-between ${
          isPaused
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
            : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30'
        }`}
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isPaused ? '▶ Unpause Contract' : '⏸ Pause Contract'}
        </span>
        {isPausedLoading && <span className="text-xs">Processing...</span>}
      </motion.button>

      {/* Emergency Withdraw Tool */}
      <div className="space-y-2">
        {!confirmWithdraw ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setConfirmWithdraw(true)}
            className="w-full p-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            🚨 Emergency Withdraw All Funds
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg"
          >
            <p className="text-red-300 text-sm font-semibold mb-3">
              ⚠️ Confirm withdrawal of {contractBalance ? (Number(contractBalance) / 1e18).toFixed(4) : '0'} POL
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleEmergencyWithdraw}
                disabled={isWithdrawLoading}
                className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-all text-sm"
              >
                {isWithdrawLoading ? 'Withdrawing...' : 'Confirm Withdraw'}
              </button>
              <button
                onClick={() => setConfirmWithdraw(false)}
                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Current Status */}
      <div className="text-xs text-gray-400 space-y-1 mt-3">
        <p>Status: {isPaused ? '⏸ Paused' : '▶ Running'}</p>
        {contractBalance !== undefined && (
          <p>Balance: {(Number(contractBalance as bigint) / 1e18).toFixed(4)} POL</p>
        )}
      </div>
    </motion.div>
  );
}
