/**
 * Admin Dashboard - Professional Contract Management Interface
 * 
 * Modern, responsive design with optimized layout for desktop and mobile
 * Clean organization with no empty spaces and intuitive navigation
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAccount, useReadContracts } from 'wagmi';
import { formatEther } from 'viem';
import {
  EnhancedSmartStakingCoreV2ABI as EnhancedSmartStakingABI,
  TreasuryManagerABI,
} from '../lib/export/abis/legacy';
import { useAdminAuth } from '../hooks/admin/useAdminAuth';
import GlobalBackground from '../ui/gradientBackground';
import ContractManager from '../components/admin/ContractManager';
import EmergencyToolsModal from '../components/admin/EmergencyToolsModal';
import DynamicAPYAdmin from '../components/admin/DynamicAPYAdmin';
import QuestManager from '../components/admin/QuestManager';
import TreasuryDashboardV2 from '../components/admin/TreasuryDashboardV2';

const STAKING_ADDR = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS as `0x${string}`;
const TREASURY_ADDR = import.meta.env.VITE_TREASURY_MANAGER_ADDRESS as `0x${string}`;

function fmtPOL(wei: bigint | undefined): string {
  if (wei === undefined) return '…';
  return parseFloat(formatEther(wei)).toFixed(2) + ' POL';
}

function fmtCountdown(seconds: bigint | undefined): string {
  if (seconds === undefined) return '…';
  const s = Number(seconds);
  if (s <= 0) return 'Ready now!';
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Admin() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { isAuthenticated, isOwner, logout } = useAdminAuth();
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const { data: contractData } = useReadContracts({
    contracts: [
      { address: STAKING_ADDR,  abi: EnhancedSmartStakingABI.abi as never, functionName: 'totalPoolBalance' },
      { address: STAKING_ADDR,  abi: EnhancedSmartStakingABI.abi as never, functionName: 'uniqueUsersCount' },
      { address: TREASURY_ADDR, abi: TreasuryManagerABI.abi as never,      functionName: 'getBalance' },
      { address: TREASURY_ADDR, abi: TreasuryManagerABI.abi as never,      functionName: 'getDistributionTimeline' },
      { address: STAKING_ADDR,  abi: EnhancedSmartStakingABI.abi as never, functionName: 'paused' },
    ],
    query: { refetchInterval: 20_000, refetchOnWindowFocus: true },
  });

  const poolBalance   = contractData?.[0]?.result as bigint | undefined;
  const usersCount    = contractData?.[1]?.result as bigint | undefined;
  const treasuryBal   = contractData?.[2]?.result as bigint | undefined;
  const timeline      = contractData?.[3]?.result as readonly [bigint, bigint, bigint, bigint, boolean] | undefined;
  const isPaused      = contractData?.[4]?.result as boolean | undefined;
  const timeUntilNext = timeline?.[3];
  const distReady     = timeline?.[4];
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
      navigate('/nothing/login');
    }
  }, [isAuthenticated, isOwner, navigate]);

  // Don't render if not authenticated
  if (!isAuthenticated || !isOwner) {
    return null;
  }

  return (
    <GlobalBackground>
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
                  <p className="text-[10px] text-slate-500">Owner Wallet</p>
                  <p className="text-xs font-mono text-slate-300">
                    {address?.slice(0, 4)}...{address?.slice(-4)}
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
        <div className="flex-1 min-h-screen overflow-auto">
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
                  {isPaused && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/30 text-[10px] sm:text-xs animate-pulse">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium whitespace-nowrap">Contract Paused</span>
                    </div>
                  )}
                  <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-[rgba(239,68,68,0.1)] text-[#ef4444] rounded-lg border border-[rgba(239,68,68,0.3)] text-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Owner Access</span>
                  </div>
                </div>
              </div>
            </motion.div>

          {/* Overview Stats Cards - High Performance Visuals */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Staking Contract - Violet Glow */}
            <div className="group relative bg-[#0a0a0a]/40 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-white/[0.05] hover:border-violet-500/20 transition-all duration-500 overflow-hidden shadow-2xl">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-600/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-start justify-between relative z-10">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 bg-violet-500/10 rounded-2xl flex items-center justify-center border border-violet-500/20 text-violet-400 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Staking Engine</h3>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-black text-white">{fmtPOL(poolBalance).split(' ')[0]}</span>
                      <span className="text-[10px] font-bold text-slate-600 uppercase">POL</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                  <span className="text-[9px] font-mono text-slate-700">{import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS?.slice(-4)}</span>
                </div>
              </div>
            </div>

            {/* Treasury Manager - Emerald Glow */}
            <div className="group relative bg-[#0a0a0a]/40 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-white/[0.05] hover:border-emerald-500/20 transition-all duration-500 overflow-hidden shadow-2xl">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-600/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-start justify-between relative z-10">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Treasury Ops</h3>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-black text-white">{fmtPOL(treasuryBal).split(' ')[0]}</span>
                      <span className="text-[10px] font-bold text-slate-600 uppercase">POL</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                    distReady ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'
                  }`}>
                    ⏱ {fmtCountdown(timeUntilNext)}
                  </div>
                  <span className="text-[9px] font-mono text-slate-700">{import.meta.env.VITE_TREASURY_MANAGER_ADDRESS?.slice(-4)}</span>
                </div>
              </div>
            </div>

            {/* System Status - Blue Glow */}
            <div className="group relative bg-[#0a0a0a]/40 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-white/[0.05] hover:border-blue-500/20 transition-all duration-500 overflow-hidden shadow-2xl">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-start justify-between relative z-10">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Live Database</h3>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-black text-white">{usersCount?.toString() || '0'}</span>
                      <span className="text-[10px] font-bold text-slate-600 uppercase">Users</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20 self-start">
                   <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                   <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">Syncing</span>
                </div>
              </div>
            </div>

            {/* Emergency Controls - Red Glow */}
            <div 
              onClick={() => setIsEmergencyModalOpen(true)}
              className="group cursor-pointer relative bg-[#0a0a0a]/40 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-white/[0.05] hover:border-red-500/40 hover:bg-red-500/5 transition-all duration-500 overflow-hidden shadow-2xl"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-600/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-start justify-between relative z-10">
                <div className="flex flex-col gap-3">
                  <div className="w-10 h-10 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 text-red-400 group-hover:scale-110 group-hover:bg-red-500/30 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Security Tools</h3>
                    <div className="mt-1">
                      <span className="text-lg sm:text-xl font-black text-white group-hover:text-red-400 transition-colors">Emergency</span>
                    </div>
                  </div>
                </div>
                <div className="mt-1">
                   <div className={`w-3 h-3 rounded-full border-2 border-black ${isPaused ? 'bg-red-500 animate-ping' : 'bg-slate-800'}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 relative z-10">
                <div className="h-[2px] flex-1 bg-white/5 overflow-hidden">
                  <motion.div 
                    className="h-full bg-red-500"
                    animate={{ x: isPaused ? ['-100%', '100%'] : '0%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  />
                </div>
              </div>
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

            {/* NEW Treasury Dashboard V2 - Advanced Health Monitoring */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-[#0a101f]/30 rounded-3xl p-1 border border-violet-500/10"
            >
               <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">Treasury Health System</h3>
                      <p className="text-xs text-slate-500 font-medium italic">Advanced Distribution & Revenue Monitoring</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] uppercase font-bold text-slate-400">v6.0 Engine</span>
                  </div>
               </div>
               <div className="p-4 sm:p-6">
                 <TreasuryDashboardV2 />
               </div>
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
    </GlobalBackground>
  );
}
