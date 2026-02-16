/**
 * AdminContractStats - Display contract statistics and health
 */

import { motion } from 'framer-motion';
import { useReadContracts } from 'wagmi';
import { formatEther } from 'viem';
import EnhancedSmartStakingABI from '../../abi/SmartStaking/EnhancedSmartStakingCoreV2.json';

const STAKING_CONTRACT = '0xAA334176a6f94Dfdb361a8c9812E8019558E9E1c' as `0x${string}`;
const TREASURY_MANAGER = '0x16c69b35D59A3FD749Ce357F1728E06F25E1Fa38' as `0x${string}`;

export default function AdminContractStats() {
  const { data: contractData, isLoading } = useReadContracts({
    contracts: [
      {
        address: STAKING_CONTRACT,
        abi: EnhancedSmartStakingABI.abi,
        functionName: 'totalPoolBalance',
      },
      {
        address: STAKING_CONTRACT,
        abi: EnhancedSmartStakingABI.abi,
        functionName: 'uniqueUsersCount',
      },
      {
        address: STAKING_CONTRACT,
        abi: EnhancedSmartStakingABI.abi,
        functionName: 'treasury',
      },
      {
        address: STAKING_CONTRACT,
        abi: EnhancedSmartStakingABI.abi,
        functionName: 'paused',
      },
      {
        address: STAKING_CONTRACT,
        abi: EnhancedSmartStakingABI.abi,
        functionName: 'owner',
      },
    ],
  });

  const totalPoolBalance = contractData?.[0]?.result as bigint | undefined;
  const uniqueUsersCount = contractData?.[1]?.result as bigint | undefined;
  const treasuryAddress = contractData?.[2]?.result as string | undefined;
  const isPaused = contractData?.[3]?.result as boolean | undefined;
  const ownerAddress = contractData?.[4]?.result as string | undefined;

  const isTreasuryCorrect = treasuryAddress?.toLowerCase() === TREASURY_MANAGER.toLowerCase();

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Contract Statistics</h3>
          <p className="text-sm text-gray-400">Real-time protocol metrics</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Pool Balance */}
          <div className="bg-black/30 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Total Pool Balance</p>
            <p className="text-2xl font-bold text-white">
              {totalPoolBalance ? formatEther(totalPoolBalance) : '0'} POL
            </p>
            <p className="text-xs text-gray-500 mt-1">Total value locked</p>
          </div>

          {/* Unique Users */}
          <div className="bg-black/30 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Unique Users</p>
            <p className="text-2xl font-bold text-white">
              {uniqueUsersCount?.toString() || '0'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total stakers</p>
          </div>

          {/* Contract Status */}
          <div className={`rounded-lg p-4 ${isPaused ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
            <p className="text-xs text-gray-400 mb-1">Contract Status</p>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
              <p className={`text-lg font-bold ${isPaused ? 'text-red-400' : 'text-green-400'}`}>
                {isPaused ? 'PAUSED' : 'ACTIVE'}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isPaused ? 'Contract operations suspended' : 'All systems operational'}
            </p>
          </div>

          {/* Treasury Config */}
          <div className={`rounded-lg p-4 ${isTreasuryCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <p className="text-xs text-gray-400 mb-1">Treasury Configuration</p>
            <div className="flex items-center space-x-2">
              {isTreasuryCorrect ? (
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <p className={`text-sm font-bold ${isTreasuryCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isTreasuryCorrect ? 'Configured Correctly' : 'Needs Attention'}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1 font-mono break-all">
              {treasuryAddress?.slice(0, 20)}...
            </p>
          </div>

          {/* Owner Address */}
          <div className="bg-black/30 rounded-lg p-4 md:col-span-2">
            <p className="text-xs text-gray-400 mb-1">Contract Owner</p>
            <p className="text-sm font-mono text-white break-all">{ownerAddress}</p>
            <div className="mt-2 flex items-center space-x-2">
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">Owner Access</span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Full Control</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`https://polygonscan.com/address/${STAKING_CONTRACT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>View on Scan</span>
          </a>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 rounded-lg transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
