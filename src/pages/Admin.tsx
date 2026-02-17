/**
 * Admin Dashboard - Professional Contract Management Interface
 * 
 * Modern, responsive design with optimized layout for desktop and mobile
 * Clean organization with no empty spaces and intuitive navigation
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAdminAuth } from '../hooks/admin/useAdminAuth';
import AdminContractStats from '../components/admin/AdminContractStats';
import ContractManager from '../components/admin/ContractManager';
import EmergencyToolsModal from '../components/admin/EmergencyToolsModal';
import DynamicAPYAdmin from '../components/admin/DynamicAPYAdmin';

export default function Admin() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { isAuthenticated, isOwner, logout } = useAdminAuth();
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

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
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Background Pattern - Brand Colors */}
      <div className="fixed inset-0 opacity-30 bg-gradient-to-br from-[#5b21b6]/20 via-transparent to-[#dc2626]/20 pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Header - Brand Styling */}
        <motion.header 
          className="border-b border-[rgba(139,92,246,0.2)] backdrop-blur-xl bg-[#0a0a0a]/80 sticky top-0 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo & Navigation */}
              <div className="flex items-center space-x-8">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:from-violet-600 group-hover:to-purple-700 transition-all">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </div>
                  <span className="font-medium">Back to App</span>
                </button>

                <div className="hidden md:flex items-center space-x-1">
                  <span className="px-3 py-1.5 bg-violet-500/10 text-violet-400 rounded-lg text-sm font-medium border border-violet-500/20">
                    Admin Panel
                  </span>
                </div>
              </div>

              {/* User Info & Actions */}
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-slate-500">Authenticated as</p>
                  <p className="text-sm font-mono text-slate-300">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
                
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-red-500/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#0a0a0a] min-h-screen overflow-auto">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Page Title - Compact */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-white">Protocol Dashboard</h1>
                  <p className="text-slate-400 text-sm">Manage contracts and monitor system health</p>
                </div>
                
                {/* Status Indicators - Brand Colors */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] rounded-lg border border-[rgba(139,92,246,0.3)] text-xs">
                    <div className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full animate-pulse"></div>
                    <span className="font-medium">Mainnet Active</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(239,68,68,0.1)] text-[#ef4444] rounded-lg border border-[rgba(239,68,68,0.3)] text-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Owner Access</span>
                  </div>
                </div>
              </div>
            </motion.div>

          {/* 4 Overview Cards - Brand Colors */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Staking Contract - Violet */}
            <div className="card-unified rounded-xl p-4 border border-[rgba(139,92,246,0.2)] hover:border-[rgba(139,92,246,0.4)] transition-all group relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[rgba(139,92,246,0.2)] rounded-lg flex items-center justify-center border border-[rgba(139,92,246,0.3)]">
                    <svg className="w-4 h-4 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Staking Core</h3>
                    <span className="text-xs text-slate-400">Main Contract</span>
                  </div>
                </div>
                <div className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full animate-pulse"></div>
              </div>
              <div className="mt-2">
                <div className="text-sm text-slate-400 font-mono break-all">
                  0xcd5F4...c2ba9
                </div>
              </div>
            </div>

            {/* Treasury Manager - Emerald */}
            <div className="card-unified rounded-xl p-4 border border-[rgba(16,185,129,0.2)] hover:border-[rgba(16,185,129,0.4)] transition-all group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[rgba(16,185,129,0.2)] rounded-lg flex items-center justify-center border border-[rgba(16,185,129,0.3)]">
                    <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Treasury</h3>
                    <span className="text-xs text-slate-400">Funds Controller</span>
                  </div>
                </div>
                <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full"></div>
              </div>
              <p className="text-xs font-mono text-slate-400 truncate">
                {import.meta.env.VITE_TREASURY_MANAGER_ADDRESS?.slice(0, 8)}...{import.meta.env.VITE_TREASURY_MANAGER_ADDRESS?.slice(-6)}
              </p>
            </div>

            {/* System Stats - Blue */}
            <div className="card-unified rounded-xl p-4 border border-[rgba(59,130,246,0.2)] hover:border-[rgba(59,130,246,0.4)] transition-all group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[rgba(59,130,246,0.2)] rounded-lg flex items-center justify-center border border-[rgba(59,130,246,0.3)]">
                    <svg className="w-4 h-4 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">System Stats</h3>
                    <span className="text-xs text-slate-400">Real-time Data</span>
                  </div>
                </div>
                <div className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full animate-pulse"></div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 text-center">
                  <p className="text-xs text-slate-400">Pool</p>
                  <p className="text-sm font-semibold text-white">28.2 POL</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xs text-slate-400">Users</p>
                  <p className="text-sm font-semibold text-white">1 Active</p>
                </div>
              </div>
            </div>

            {/* Quick Actions - Red */}
            <div className="card-unified rounded-xl p-4 border border-[rgba(239,68,68,0.2)] hover:border-[rgba(239,68,68,0.4)] transition-all group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[rgba(239,68,68,0.2)] rounded-lg flex items-center justify-center border border-[rgba(239,68,68,0.3)]">
                    <svg className="w-4 h-4 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Quick Actions</h3>
                    <span className="text-xs text-slate-400">Emergency Tools</span>
                  </div>
                </div>
                <div className="w-1.5 h-1.5 bg-[#ef4444] rounded-full"></div>
              </div>
              <button
                onClick={() => setIsEmergencyModalOpen(true)}
                className="mt-2 flex items-center gap-2 px-3 py-2 bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.2)] text-[#ef4444] rounded-lg text-sm font-medium border border-[rgba(239,68,68,0.3)] transition-all w-full justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Emergency Tools</span>
              </button>
            </div>
          </motion.div>

          {/* Main Dashboard Grid - Optimized Layout */}
          <div className="grid grid-cols-1 gap-4">
            {/* Contract Manager - Full Width */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ContractManager />
            </motion.div>

            {/* Admin Contract Stats - Full Width */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <AdminContractStats />
            </motion.div>

            {/* Dynamic APY Admin - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <DynamicAPYAdmin />
            </motion.div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <EmergencyToolsModal 
        isOpen={isEmergencyModalOpen} 
        onClose={() => setIsEmergencyModalOpen(false)} 
      />
    </div>
    </div>
  );
}
