/**
 * Admin Dashboard - Contract Management Tools
 * 
 * Protected route for owner-only contract management
 * Requires authentication via wallet signature
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAdminAuth } from '../hooks/admin/useAdminAuth';
import AdminTreasuryFix from '../components/admin/AdminTreasuryFix';
import AdminContractStats from '../components/admin/AdminContractStats';
import ContractManager from '../components/admin/ContractManager';

export default function Admin() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { isAuthenticated, isOwner, logout } = useAdminAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !isOwner) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isOwner, navigate]);

  // Don't render if not authenticated
  if (!isAuthenticated || !isOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with User Info & Logout */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400 mt-1">Protocol Management & Emergency Tools</p>
              </div>
            </div>

            {/* User Badge */}
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-green-400 font-medium">OWNER ACCESS</p>
                  <p className="text-xs text-gray-400 font-mono">{address?.slice(0, 10)}...{address?.slice(-8)}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-4 mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-1">⚡ High-Privilege Actions</h3>
              <p className="text-sm text-gray-300">
                You have full owner access to protocol contracts. All transactions are permanent and irreversible. 
                Always verify contract addresses and amounts before confirming transactions.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-white font-semibold">Staking Contract</h3>
            </div>
            <p className="text-gray-400 text-sm font-mono">0xAA334176...558E9E1c</p>
            <div className="mt-3 flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Active</span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Mainnet</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold">Treasury Manager</h3>
            </div>
            <p className="text-gray-400 text-sm font-mono">0x16c69b35...E06F25E1Fa38</p>
            <div className="mt-3 flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Deployed</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold">Session Status</h3>
            </div>
            <p className="text-gray-400 text-sm">Authenticated</p>
            <div className="mt-3 flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Expires in ~60 min</span>
            </div>
          </div>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Contract Manager - Dynamic tool for any contract */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <ContractManager />
          </motion.div>

          {/* Contract Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AdminContractStats />
          </motion.div>
        </div>

        {/* Secondary Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Treasury Fix Tool */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AdminTreasuryFix />
          </motion.div>
        </div>

        {/* Additional Tools Section */}
        <motion.div
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
            <span>Advanced Management Tools</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Contract Pause/Unpause */}
            <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50 hover:border-yellow-500/30 transition-all cursor-not-allowed opacity-50">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-semibold text-white">Emergency Pause</h4>
              </div>
              <p className="text-xs text-gray-400 mb-3">Pause/unpause contract operations</p>
              <span className="text-xs text-yellow-400">Coming Soon</span>
            </div>

            {/* Emergency Withdraw */}
            <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50 hover:border-red-500/30 transition-all cursor-not-allowed opacity-50">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h4 className="font-semibold text-white">Emergency Withdraw</h4>
              </div>
              <p className="text-xs text-gray-400 mb-3">Emergency fund recovery</p>
              <span className="text-xs text-red-400">Coming Soon</span>
            </div>

            {/* Module Management */}
            <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50 hover:border-blue-500/30 transition-all cursor-not-allowed opacity-50">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <h4 className="font-semibold text-white">Module Config</h4>
              </div>
              <p className="text-xs text-gray-400 mb-3">Configure staking modules</p>
              <span className="text-xs text-blue-400">Coming Soon</span>
            </div>

            {/* Transfer Ownership */}
            <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/30 transition-all cursor-not-allowed opacity-50">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <h4 className="font-semibold text-white">Transfer Ownership</h4>
              </div>
              <p className="text-xs text-gray-400 mb-3">Transfer contract ownership</p>
              <span className="text-xs text-purple-400">Coming Soon</span>
            </div>

            {/* View Events */}
            <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50 hover:border-green-500/30 transition-all cursor-not-allowed opacity-50">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h4 className="font-semibold text-white">Event Logs</h4>
              </div>
              <p className="text-xs text-gray-400 mb-3">View contract event history</p>
              <span className="text-xs text-green-400">Coming Soon</span>
            </div>

            {/* Analytics */}
            <div className="bg-black/30 rounded-lg p-4 border border-gray-700/50 hover:border-orange-500/30 transition-all cursor-not-allowed opacity-50">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h4 className="font-semibold text-white">Advanced Analytics</h4>
              </div>
              <p className="text-xs text-gray-400 mb-3">Detailed protocol analytics</p>
              <span className="text-xs text-orange-400">Coming Soon</span>
            </div>
          </div>
        </motion.div>

        {/* Help Section */}
        <motion.div
          className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-blue-400 mb-3">ℹ️ Need Help?</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>For treasury issues, use the Treasury Configuration Fix tool above</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Always verify contract addresses before executing transactions</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Check PolygonScan for transaction confirmations</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Contact the development team if you encounter any issues</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
