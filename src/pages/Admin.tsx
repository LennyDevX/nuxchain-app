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
import QuestManager from '../components/admin/QuestManager';

export default function Admin() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { isAuthenticated, isOwner, logout } = useAdminAuth();
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Header auto-hide on scroll (mobile)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          setHeaderVisible(false);
        } else {
          setHeaderVisible(true);
        }
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
        {/* Header - Mobile Optimized with Auto-hide */}
        <motion.header 
          className="border-b border-[rgba(139,92,246,0.2)] backdrop-blur-xl bg-[#0a0a0a]/90 sticky top-0 z-50 transition-transform duration-300"
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: 1, 
            y: headerVisible ? 0 : -100 
          }}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Logo & Navigation - Compact for mobile */}
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:from-violet-600 group-hover:to-purple-700 transition-all">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </div>
                  <span className="font-medium text-sm hidden sm:inline">Back to App</span>
                </button>

                <div className="hidden md:flex items-center">
                  <span className="px-2 py-1 bg-violet-500/10 text-violet-400 rounded-lg text-xs font-medium border border-violet-500/20">
                    Admin
                  </span>
                </div>
              </div>

              {/* User Info & Actions - Simplified for mobile */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] text-slate-500">Authenticated</p>
                  <p className="text-xs font-mono text-slate-300">
                    {address?.slice(0, 4)}...{address?.slice(-3)}
                  </p>
                </div>
                
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-red-500/20"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline text-xs">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#0a0a0a] min-h-screen overflow-auto">
          <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
            {/* Page Title - Compact */}
            <motion.div 
              className="mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">Protocol Dashboard</h1>
                  <p className="text-slate-400 text-xs sm:text-sm">Manage contracts and monitor system health</p>
                </div>
                
                {/* Status Indicators - Brand Colors */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-[rgba(139,92,246,0.1)] text-[#8b5cf6] rounded-lg border border-[rgba(139,92,246,0.3)] text-[10px] sm:text-xs">
                    <div className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full animate-pulse" />
                    <span className="font-medium whitespace-nowrap">Mainnet Active</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-[rgba(239,68,68,0.1)] text-[#ef4444] rounded-lg border border-[rgba(239,68,68,0.3)] text-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Owner Access</span>
                  </div>
                </div>
              </div>
            </motion.div>

          {/* 4 Overview Cards - Mobile Optimized */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Staking Contract - Violet */}
            <div className="card-unified rounded-xl p-3 sm:p-4 border border-[rgba(139,92,246,0.2)] hover:border-[rgba(139,92,246,0.4)] transition-all group relative">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[rgba(139,92,246,0.2)] rounded-lg flex items-center justify-center border border-[rgba(139,92,246,0.3)]">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-xs sm:text-sm">Staking</h3>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">Main Contract</span>
                  </div>
                </div>
                <div className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full animate-pulse" />
              </div>
              <div className="mt-1 sm:mt-2">
                <div className="text-[10px] sm:text-xs text-slate-400 font-mono truncate">
                  0xcd5F4...c2ba9
                </div>
              </div>
            </div>

            {/* Treasury Manager - Emerald */}
            <div className="card-unified rounded-xl p-3 sm:p-4 border border-[rgba(16,185,129,0.2)] hover:border-[rgba(16,185,129,0.4)] transition-all group">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[rgba(16,185,129,0.2)] rounded-lg flex items-center justify-center border border-[rgba(16,185,129,0.3)]">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-xs sm:text-sm">Treasury</h3>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">Funds Controller</span>
                  </div>
                </div>
                <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full" />
              </div>
              <p className="text-[10px] sm:text-xs font-mono text-slate-400 truncate">
                {import.meta.env.VITE_TREASURY_MANAGER_ADDRESS?.slice(0, 6)}...{import.meta.env.VITE_TREASURY_MANAGER_ADDRESS?.slice(-4)}
              </p>
            </div>

            {/* System Stats - Blue */}
            <div className="card-unified rounded-xl p-3 sm:p-4 border border-[rgba(59,130,246,0.2)] hover:border-[rgba(59,130,246,0.4)] transition-all group">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[rgba(59,130,246,0.2)] rounded-lg flex items-center justify-center border border-[rgba(59,130,246,0.3)]">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-xs sm:text-sm">System</h3>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">Real-time Data</span>
                  </div>
                </div>
                <div className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full animate-pulse" />
              </div>
              <div className="flex gap-1 sm:gap-2">
                <div className="flex-1 text-center">
                  <p className="text-[10px] text-slate-400">Pool</p>
                  <p className="text-xs sm:text-sm font-semibold text-white">28.2 POL</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-[10px] text-slate-400">Users</p>
                  <p className="text-xs sm:text-sm font-semibold text-white">1 Active</p>
                </div>
              </div>
            </div>

            {/* Quick Actions - Red */}
            <div className="card-unified rounded-xl p-3 sm:p-4 border border-[rgba(239,68,68,0.2)] hover:border-[rgba(239,68,68,0.4)] transition-all group">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[rgba(239,68,68,0.2)] rounded-lg flex items-center justify-center border border-[rgba(239,68,68,0.3)]">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-xs sm:text-sm">Actions</h3>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">Emergency Tools</span>
                  </div>
                </div>
                <div className="w-1.5 h-1.5 bg-[#ef4444] rounded-full" />
              </div>
              <button
                onClick={() => setIsEmergencyModalOpen(true)}
                className="mt-1 sm:mt-2 flex items-center justify-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.2)] text-[#ef4444] rounded-lg text-xs font-medium border border-[rgba(239,68,68,0.3)] transition-all w-full"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="whitespace-nowrap">Emergency</span>
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

            {/* Quest Manager - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <QuestManager />
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
