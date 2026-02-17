/**
 * AdminTreasuryFix - Emergency component to fix treasury address configuration
 * 
 * ISSUE FOUND: Staking contract is sending commissions to wrong address
 * - Current: Unknown (check contract)
 * - Expected: 0x92BA711B203CF40bb6c5f7f509E0f48aa19e2cD9 (TreasuryManager)
 * 
 * This component allows the contract owner to:
 * 1. Query the current treasury address
 * 2. Update it to the correct Treasury Manager address
 */

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { motion } from 'framer-motion';
import EnhancedSmartStakingABI from '../../abi/SmartStaking/EnhancedSmartStakingCoreV2.json';

const STAKING_CONTRACT = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS as `0x${string}`;
const TREASURY_MANAGER = import.meta.env.VITE_TREASURY_MANAGER_ADDRESS as `0x${string}`;

export default function AdminTreasuryFix() {
  const { address, isConnected } = useAccount();
  const [status, setStatus] = useState('');

  // 1️⃣ Query current treasury address from contract
  const { data: currentTreasury, isLoading: loadingTreasury, refetch } = useReadContract({
    address: STAKING_CONTRACT,
    abi: EnhancedSmartStakingABI.abi,
    functionName: 'treasury',
  });

  // 2️⃣ Query contract owner
  const { data: contractOwner } = useReadContract({
    address: STAKING_CONTRACT,
    abi: EnhancedSmartStakingABI.abi,
    functionName: 'owner',
  });

  // 3️⃣ Write function to update treasury
  const { 
    data: hash, 
    isPending, 
    writeContract 
  } = useWriteContract();

  // 4️⃣ Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleUpdateTreasury = async () => {
    if (!isConnected || !address) {
      setStatus('❌ Please connect your wallet');
      return;
    }

    if (address.toLowerCase() !== contractOwner?.toString().toLowerCase()) {
      setStatus('❌ Only contract owner can update treasury');
      return;
    }

    try {
      setStatus('🔄 Submitting transaction...');
      writeContract({
        address: STAKING_CONTRACT,
        abi: EnhancedSmartStakingABI.abi,
        functionName: 'changeTreasuryAddress',
        args: [TREASURY_MANAGER],
      });
    } catch (error) {
      console.error('Error updating treasury:', error);
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Update status when transaction is confirmed
  if (isSuccess && status.includes('Submitting')) {
    setStatus('✅ Treasury updated successfully! Refreshing...');
    setTimeout(() => {
      refetch();
    }, 2000);
  }

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return 'Loading...';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isCorrect = currentTreasury?.toString().toLowerCase() === TREASURY_MANAGER.toLowerCase();

  return (
    <motion.div
      className="bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-xl p-6 border border-red-500/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Treasury Configuration Fix</h3>
          <p className="text-sm text-gray-400">Admin Tool - Owner Only</p>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`mb-4 p-3 rounded-lg ${
        isCorrect 
          ? 'bg-green-500/10 border border-green-500/30' 
          : 'bg-red-500/10 border border-red-500/30'
      }`}>
        <p className={`text-sm font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
          {isCorrect 
            ? '✅ Treasury is correctly configured' 
            : '⚠️ Treasury is misconfigured - commissions going to wrong address!'
          }
        </p>
      </div>

      {/* Contract Info */}
      <div className="space-y-3 mb-6">
        <div className="bg-black/30 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Staking Contract</p>
          <p className="text-white font-mono text-sm">{STAKING_CONTRACT}</p>
        </div>

        <div className="bg-black/30 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Contract Owner</p>
          <p className="text-white font-mono text-sm">
            {loadingTreasury ? 'Loading...' : formatAddress(contractOwner?.toString())}
          </p>
        </div>

        <div className={`rounded-lg p-4 ${
          isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'
        }`}>
          <p className="text-xs text-gray-400 mb-1">Current Treasury (in contract)</p>
          <p className="text-white font-mono text-sm">
            {loadingTreasury ? 'Loading...' : currentTreasury?.toString()}
          </p>
          {!isCorrect && (
            <p className="text-xs text-red-400 mt-2">
              ⚠️ This address is receiving commissions but it's not the Treasury Manager!
            </p>
          )}
        </div>

        <div className="bg-black/30 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Expected Treasury (Treasury Manager)</p>
          <p className="text-green-400 font-mono text-sm">{TREASURY_MANAGER}</p>
        </div>
      </div>

      {/* Transaction Evidence */}
      {!isCorrect && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-orange-400 font-medium mb-2">📊 Evidence from Transaction</p>
          <p className="text-xs text-gray-300">
            In deposit tx <code className="text-orange-300">0x12b7c6437f3258f2ec1011183407a3dbd791f2d870d655bcce2f524214b568e5</code>:
          </p>
          <ul className="text-xs text-gray-300 mt-2 space-y-1 list-disc list-inside">
            <li>Deposit: 10 POL</li>
            <li>Commission (6%): 0.6 POL</li>
            <li>Commission sent to: <code className="text-red-300">{currentTreasury?.toString()}</code></li>
            <li>❌ Should go to: <code className="text-green-300">{TREASURY_MANAGER}</code></li>
          </ul>
        </div>
      )}

      {/* Action Button */}
      {!isCorrect && (
        <div className="space-y-3">
          <button
            onClick={handleUpdateTreasury}
            disabled={
              !isConnected || 
              loadingTreasury || 
              isPending || 
              isConfirming ||
              address?.toLowerCase() !== contractOwner?.toString().toLowerCase()
            }
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              address?.toLowerCase() === contractOwner?.toString().toLowerCase()
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50'
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
            }`}
          >
            {!isConnected 
              ? '🔌 Connect Wallet' 
              : address?.toLowerCase() !== contractOwner?.toString().toLowerCase()
              ? '🔒 Owner Only'
              : isPending || isConfirming
              ? '⏳ Updating Treasury...'
              : '🔧 Fix Treasury Address'
            }
          </button>

          {status && (
            <div className={`p-3 rounded-lg text-sm ${
              status.includes('✅') 
                ? 'bg-green-500/10 text-green-400' 
                : status.includes('❌')
                ? 'bg-red-500/10 text-red-400'
                : 'bg-blue-500/10 text-blue-400'
            }`}>
              {status}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-xs text-blue-400 font-medium mb-2">ℹ️ How to Fix</p>
        <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside">
          <li>Connect wallet with owner address: {formatAddress(contractOwner?.toString())}</li>
          <li>Click "Fix Treasury Address" button</li>
          <li>Confirm transaction in MetaMask</li>
          <li>Wait for confirmation (~2-5 seconds on Polygon)</li>
          <li>Treasury will be updated to correct address</li>
          <li>Future commissions will go to Treasury Manager</li>
        </ol>
        <p className="text-xs text-orange-400 mt-3">
          ⚠️ Note: This only affects future commissions. Past commissions sent to the wrong address cannot be recovered automatically.
        </p>
      </div>

      {/* Transaction Link */}
      {hash && (
        <a
          href={`https://polygonscan.com/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View transaction on PolygonScan →
        </a>
      )}
    </motion.div>
  );
}
